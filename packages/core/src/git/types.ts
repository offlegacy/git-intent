import type { SimpleGit } from 'simple-git';

export interface GitServiceInterface {
  getGit(cwd?: string): SimpleGit;
  execGit(args: string[], options?: { input?: string; cwd?: string }): string;
  checkIsRepo(cwd?: string): Promise<boolean>;
  getRepoRoot(cwd?: string): Promise<string>;
  getCurrentBranch(cwd?: string): Promise<string>;
  getStatus(cwd?: string): Promise<any>;
  hasStagedFiles(cwd?: string): Promise<boolean>;
  createCommit(message: string, cwd?: string): Promise<string>;
  hashObject(content: string, cwd?: string): Promise<string>;
  raw(commands: string[], cwd?: string): Promise<string>;
}
