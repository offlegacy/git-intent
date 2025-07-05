import { execSync } from "node:child_process";
import type { Branch, Project } from "../db/schema";

export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitError";
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function execGit(command: string): string {
  try {
    return execSync(`git ${command}`, { encoding: "utf-8" }).trim();
  } catch (error) {
    throw new GitError(`Git command failed: ${getErrorMessage(error)}`);
  }
}

export function getProjectMetadata(): Project {
  try {
    const repoPath = execGit("rev-parse --show-toplevel");
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

export function getBranchMetadata(): Branch {
  try {
    const branchName = execGit("rev-parse --abbrev-ref HEAD");
    const projectId = execGit("rev-parse --show-toplevel");

    if (branchName === "HEAD") {
      throw new GitError("Cannot determine branch name in detached HEAD state");
    }

    const branchRefHashId = execGit(`rev-parse --verify ${branchName}`);

    return {
      id: branchRefHashId,
      name: branchName,
      projectId,
    };
  } catch (error) {
    throw new GitError(
      `Failed to get branch metadata: ${getErrorMessage(error)}`,
    );
  }
}

export function commit(message: string) {
  if (!message) {
    throw new Error("Commit message is required");
  }

  try {
    const safeMessage = message.replace(/"/g, '\\"');
    execGit(`commit -m "${safeMessage}"`);
    const commitHash = execGit("rev-parse HEAD");

    return {
      commitHash,
    };
  } catch (error) {
    throw new GitError(`Failed to commit changes: ${getErrorMessage(error)}`);
  }
}
