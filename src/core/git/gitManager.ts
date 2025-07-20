import path from "node:path";
import { type SimpleGit, type SimpleGitOptions, simpleGit } from "simple-git";
import type { NewBranch, NewProject } from "../db/schema";
import { getErrorMessage } from "../utils/error";
import {
  EmptyCommitMessageError,
  GitError,
  IsNotGitRepositoryError,
} from "./errors";

interface GitServiceConfig {
  gitProvider?: typeof simpleGit;
  repoPath?: string;
  gitOptions?: Partial<SimpleGitOptions>;
}

const gitInstances = new Map<string, SimpleGit>();

export function createGitService(config: GitServiceConfig = {}) {
  const {
    gitProvider: gitFactory = simpleGit,
    repoPath = process.cwd(),
    gitOptions = { trimmed: true },
  } = config;

  function getGitInstance(): SimpleGit {
    const normalizedPath = path.resolve(repoPath);
    let instance = gitInstances.get(normalizedPath);

    if (!instance) {
      instance = gitFactory(normalizedPath, gitOptions);
      gitInstances.set(normalizedPath, instance);
    }

    return instance;
  }

  async function checkIsRepo(): Promise<void> {
    try {
      const git = getGitInstance();
      const isGitRepo = await git.checkIsRepo();

      if (!isGitRepo) {
        throw new IsNotGitRepositoryError(
          "Current directory is not a git repository",
        );
      }
    } catch (error) {
      if (error instanceof IsNotGitRepositoryError) {
        throw error;
      }

      throw new GitError(
        `Failed to check if directory is a Git repository: ${getErrorMessage(error)}`,
      );
    }
  }

  async function getProjectMetadata(): Promise<NewProject> {
    const git = getGitInstance();
    await checkIsRepo();

    try {
      const repoPath = await git.revparse(["--show-toplevel"]);
      const repoName = path.basename(repoPath);

      return {
        id: repoPath, // TODO: make it unique
        repoPath,
        repoName,
      };
    } catch (error) {
      throw new GitError(
        `Failed to get project metadata: ${getErrorMessage(error)}`,
      );
    }
  }

  async function getBranchMetadata(projectId: string): Promise<NewBranch> {
    const git = getGitInstance();
    await checkIsRepo();

    try {
      const branchSummary = await git.branchLocal();

      if (branchSummary.detached) {
        throw new GitError(
          "Cannot determine branch name in detached HEAD state",
        );
      }

      const currentBranchFull = await git.raw("symbolic-ref", "HEAD");
      const currentBranchShort = await git.raw(
        "symbolic-ref",
        "HEAD",
        "--short",
      );

      return {
        id: currentBranchFull,
        name: currentBranchShort,
        projectId,
      };
    } catch (error) {
      throw new GitError(
        `Failed to get branch metadata: ${getErrorMessage(error)}`,
      );
    }
  }

  async function commit(message: string): Promise<string> {
    const git = getGitInstance();
    await checkIsRepo();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new EmptyCommitMessageError("Commit message is required");
    }

    try {
      const commitResult = await git.commit(trimmedMessage);

      return commitResult.commit;
    } catch (error) {
      throw new GitError(`Failed to commit changes: ${getErrorMessage(error)}`);
    }
  }

  return {
    commit,
    getBranchMetadata,
    getProjectMetadata,
  };
}

export const __testing__ = {
  clearGlobalCache: () => gitInstances.clear(),
  getGlobalCacheSize: () => gitInstances.size,
};
