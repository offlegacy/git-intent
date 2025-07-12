export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitError";
  }
}

export class EmptyCommitMessageError extends GitError {
  constructor(message: string) {
    super(message);
  }
}

export class IsNotGitRepositoryError extends GitError {
  constructor(message: string) {
    super(message);
  }
}
