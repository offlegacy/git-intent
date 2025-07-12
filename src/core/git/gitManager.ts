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

export function createGitService(config: GitServiceConfig = {}) {
  const {
    gitProvider: gitFactory = simpleGit,
    repoPath = process.cwd(),
    gitOptions = { trimmed: true },
  } = config;
  const gitInstances = new Map<string, SimpleGit>();

  function getGitInstance(): SimpleGit {
    const normalizedPath = path.resolve(repoPath);

    if (!gitInstances.has(normalizedPath)) {
      const newGitInstance = gitFactory(normalizedPath, gitOptions);
      gitInstances.set(normalizedPath, newGitInstance);
    }

    return gitInstances.get(normalizedPath)!;
  }

  async function checkIsRepo(): Promise<boolean> {
    try {
      const git = getGitInstance();
      const isRepo = await git.checkIsRepo();
      return isRepo;
    } catch (error) {
      throw new GitError(
        `Failed to check if directory is a Git repository: ${getErrorMessage(error)}`,
      );
    }
  }

  async function getProjectMetadata(): Promise<NewProject> {
    const git = getGitInstance();

    const isGitRepo = await checkIsRepo();
    if (!isGitRepo) {
      throw new IsNotGitRepositoryError(
        "Current directory is not a git repository",
      );
    }

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

    const isGitRepo = await checkIsRepo();
    if (!isGitRepo) {
      throw new IsNotGitRepositoryError(
        "Current directory is not a git repository",
      );
    }

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

    const isGitRepo = await checkIsRepo();
    if (!isGitRepo) {
      throw new IsNotGitRepositoryError(
        "Current directory is not a git repository",
      );
    }

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
