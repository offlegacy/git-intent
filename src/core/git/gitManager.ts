import path from "node:path";
import { type SimpleGit, type SimpleGitOptions, simpleGit } from "simple-git";
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

  async function commit(message: string): Promise<string> {
    const git = getGitInstance();

    const isGitRepo = await git.checkIsRepo();
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
  };
}
