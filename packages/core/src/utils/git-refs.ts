import { git } from './git.js';

class GitRefsService {
  private static instance: GitRefsService;

  private constructor() {}

  static getInstance(): GitRefsService {
    if (!GitRefsService.instance) {
      GitRefsService.instance = new GitRefsService();
    }
    return GitRefsService.instance;
  }

  async createTree(treeContent: string, cwd?: string): Promise<string> {
    if (!treeContent || treeContent.trim() === '') {
      throw new Error('Invalid tree content: tree content cannot be empty');
    }
    return git.execGit(['mktree'], { input: treeContent, cwd });
  }

  async createCommitTree(treeHash: string, message: string, cwd?: string): Promise<string> {
    if (!treeHash || treeHash.trim() === '') {
      throw new Error('Invalid tree hash: tree hash cannot be empty');
    }

    try {
      const result = git.execGit(['commit-tree', treeHash, '-m', message], { cwd });

      if (!result || result.trim() === '') {
        throw new Error(`Failed to create commit tree from hash: ${treeHash}`);
      }

      return result;
    } catch (error) {
      console.error('Error creating commit tree:', error);
      throw error;
    }
  }

  async updateRef(refName: string, commitHash: string, cwd?: string): Promise<void> {
    if (!commitHash || commitHash.trim() === '') {
      throw new Error(`Invalid commit hash: commit hash cannot be empty for ref ${refName}`);
    }

    await git.raw(['update-ref', refName, commitHash], cwd);
  }

  async deleteRef(refName: string, cwd?: string): Promise<void> {
    await git.raw(['update-ref', '-d', refName], cwd);
  }

  async checkRefExists(refName: string, cwd?: string): Promise<boolean> {
    try {
      await git.raw(['show-ref', '--verify', refName], cwd);
      return true;
    } catch {
      return false;
    }
  }

  async showRef(refPath: string, cwd?: string): Promise<string> {
    try {
      return await git.raw(['show', refPath], cwd);
    } catch (error) {
      throw new Error(`Failed to show ref: ${refPath}`);
    }
  }
}

export const gitRefs = GitRefsService.getInstance();
