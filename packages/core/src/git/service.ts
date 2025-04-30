import { spawnSync } from 'node:child_process';
import { type SimpleGit, simpleGit } from 'simple-git';
import { GitError } from '../errors/index.js';
import type { GitServiceInterface } from './types.js';

class GitService implements GitServiceInterface {
  private static instance: GitService;
  private gitInstances: Map<string, SimpleGit> = new Map();
  private defaultGit: SimpleGit;

  private constructor() {
    this.defaultGit = simpleGit();
    this.gitInstances.set('default', this.defaultGit);
  }

  static getInstance(): GitService {
    if (!GitService.instance) {
      GitService.instance = new GitService();
    }
    return GitService.instance;
  }

  getGit(cwd?: string): SimpleGit {
    if (!cwd) {
      return this.defaultGit;
    }

    const cacheKey = cwd;
    if (!this.gitInstances.has(cacheKey)) {
      this.gitInstances.set(cacheKey, simpleGit(cwd));
    }

    return this.gitInstances.get(cacheKey) as SimpleGit;
  }

  execGit(args: string[], options: { input?: string; cwd?: string } = {}): string {
    const { input, cwd } = options;

    try {
      const result = spawnSync('git', args, {
        input: input ? Buffer.from(input) : undefined,
        cwd,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      if (result.status !== 0) {
        throw new GitError(`Git command failed: git ${args.join(' ')}\n${result.stderr}`, 'GIT_COMMAND_FAILED');
      }

      return result.stdout ? result.stdout.trim() : '';
    } catch (error) {
      if (error instanceof GitError) {
        throw error;
      }
      throw new GitError(`Git execution error: ${(error as Error).message}`, 'GIT_EXEC_ERROR');
    }
  }

  async checkIsRepo(cwd?: string): Promise<boolean> {
    try {
      const git = this.getGit(cwd);
      const isRepo = await git.checkIsRepo();
      return isRepo;
    } catch (error) {
      throw new GitError(
        `Failed to check if directory is a Git repository: ${(error as Error).message}`,
        'CHECK_REPO_ERROR'
      );
    }
  }

  async getRepoRoot(cwd?: string): Promise<string> {
    try {
      const git = this.getGit(cwd);
      const root = await git.revparse(['--show-toplevel']);
      return root.trim();
    } catch (error) {
      throw new GitError(`Failed to get repository root: ${(error as Error).message}`, 'REPO_ROOT_ERROR');
    }
  }

  async getCurrentBranch(cwd?: string): Promise<string> {
    try {
      const git = this.getGit(cwd);
      const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
      return branch.trim();
    } catch (error) {
      throw new GitError(`Failed to get current branch: ${(error as Error).message}`, 'CURRENT_BRANCH_ERROR');
    }
  }

  async getStatus(cwd?: string): Promise<any> {
    try {
      const git = this.getGit(cwd);
      return await git.status();
    } catch (error) {
      throw new GitError(`Failed to get repository status: ${(error as Error).message}`, 'STATUS_ERROR');
    }
  }

  async hasStagedFiles(cwd?: string): Promise<boolean> {
    try {
      const status = await this.getStatus(cwd);
      return status.staged.length > 0;
    } catch (error) {
      throw new GitError(`Failed to check for staged files: ${(error as Error).message}`, 'STAGED_FILES_ERROR');
    }
  }

  async createCommit(message: string, cwd?: string): Promise<string> {
    try {
      const git = this.getGit(cwd);
      const result = await git.commit(message);
      return result.commit;
    } catch (error) {
      throw new GitError(`Failed to create commit: ${(error as Error).message}`, 'CREATE_COMMIT_ERROR');
    }
  }

  async hashObject(content: string, cwd?: string): Promise<string> {
    try {
      return this.execGit(['hash-object', '-w', '--stdin'], { input: content, cwd });
    } catch (error) {
      throw new GitError(`Failed to hash object: ${(error as Error).message}`, 'HASH_OBJECT_ERROR');
    }
  }

  async raw(commands: string[], cwd?: string): Promise<string> {
    try {
      const git = this.getGit(cwd);
      return await git.raw(commands);
    } catch (error) {
      throw new GitError(`Failed to execute raw git command: ${(error as Error).message}`, 'RAW_COMMAND_ERROR');
    }
  }
}

export function createGitService(): GitServiceInterface {
  return GitService.getInstance();
}

export const gitService = GitService.getInstance();
