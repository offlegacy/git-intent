import { spawnSync } from 'node:child_process';
import { type SimpleGit, simpleGit } from 'simple-git';

class GitService {
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

    const result = spawnSync('git', args, {
      input: input ? Buffer.from(input) : undefined,
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (result.status !== 0) {
      throw new Error(`Git command failed: git ${args.join(' ')}\n${result.stderr}`);
    }

    return result.stdout ? result.stdout.trim() : '';
  }

  async checkIsRepo(cwd?: string): Promise<boolean> {
    const git = this.getGit(cwd);
    const isRepo = await git.checkIsRepo();

    return isRepo;
  }

  async getRepoRoot(cwd?: string): Promise<string> {
    const git = this.getGit(cwd);
    const root = await git.revparse(['--show-toplevel']);
    return root.trim();
  }

  async getCurrentBranch(cwd?: string): Promise<string> {
    const git = this.getGit(cwd);
    const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
    return branch.trim();
  }

  async getStatus(cwd?: string): Promise<any> {
    const git = this.getGit(cwd);
    return await git.status();
  }

  async hasStagedFiles(cwd?: string): Promise<boolean> {
    const status = await this.getStatus(cwd);
    return status.staged.length > 0;
  }

  async createCommit(message: string, cwd?: string): Promise<string> {
    const git = this.getGit(cwd);
    const result = await git.commit(message);
    return result.commit;
  }

  async hashObject(content: string, cwd?: string): Promise<string> {
    return this.execGit(['hash-object', '-w', '--stdin'], { input: content, cwd });
  }

  async raw(commands: string[], cwd?: string): Promise<string> {
    const git = this.getGit(cwd);
    return await git.raw(commands);
  }
}

export const git = GitService.getInstance();

export default git.getGit();
