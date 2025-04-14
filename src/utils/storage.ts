import path from 'node:path';
import execa from 'execa';
import fs from 'fs-extra';
import { generateId } from './generateId';
import { getPackageInfo } from './get-package-info';
import git, { checkIsRepo } from './git';

export type IntentionalCommit = {
  id: string;
  message: string;
  status: 'created' | 'in_progress';
  metadata: {
    createdAt: string;
    startedAt?: string;
    branch?: string;
  };
};

export type StorageData = {
  version: string;
  commits: IntentionalCommit[];
};

export class GitIntentionalCommitStorage {
  private static instance: GitIntentionalCommitStorage;
  private readonly REFS_PREFIX = 'refs/intentional-commits';
  private storageFilename;
  private readonly GIT_DIR = '.git';
  private gitRoot: string | undefined;

  private constructor() {
    this.storageFilename = process.env.VITEST ? 'test_intents.json' : 'intents.json';
  }

  static getInstance(): GitIntentionalCommitStorage {
    if (!GitIntentionalCommitStorage.instance) {
      GitIntentionalCommitStorage.instance = new GitIntentionalCommitStorage();
    }
    return GitIntentionalCommitStorage.instance;
  }

  setGitRoot(root: string): void {
    this.gitRoot = root;
  }

  async getGitRoot(): Promise<string> {
    if (this.gitRoot) return this.gitRoot;
    return process.cwd();
  }

  private async getCommitsDir(): Promise<string> {
    const root = await this.getGitRoot();
    return path.join(root, this.GIT_DIR, 'intentional-commits');
  }

  private async getCommitsFile(): Promise<string> {
    const commitsDir = await this.getCommitsDir();
    return path.join(commitsDir, 'commits.json');
  }

  private getInitialData(): StorageData {
    return {
      version: getPackageInfo().version,
      commits: [],
    };
  }

  private async ensureCommitsDir(): Promise<void> {
    const commitsDir = await this.getCommitsDir();
    const commitsFile = await this.getCommitsFile();

    await fs.ensureDir(commitsDir);
    try {
      await fs.access(commitsFile);
    } catch {
      await fs.writeJSON(commitsFile, this.getInitialData());
    }
  }

  // NOTE: Migrate old data
  private migrateData(data: any): StorageData {
    return data;
  }

  async loadCommits(): Promise<IntentionalCommit[]> {
    const root = await this.getGitRoot();
    await checkIsRepo(root);
    await this.ensureCommitsDir();

    try {
      const result = await git.cwd(root).show(`${this.REFS_PREFIX}/commits:${this.storageFilename}`);
      const data = this.migrateData(JSON.parse(result));

      console.log(data);
      return data.commits;
    } catch {
      const commitsFile = await this.getCommitsFile();
      const data = this.migrateData(await fs.readJSON(commitsFile));
      console.log(data);
      return data.commits;
    }
  }

  private async saveCommitsData(data: StorageData): Promise<void> {
    const root = await this.getGitRoot();
    const commitsFile = await this.getCommitsFile();
    const content = JSON.stringify(data, null, 2);

    const { stdout: hash } = await execa('git', ['hash-object', '-w', '--stdin'], { input: content, cwd: root });
    const treeContent = `100644 blob ${hash.trim()}\t${this.storageFilename}\n`;
    const { stdout: treeHash } = await execa('git', ['mktree'], { input: treeContent, cwd: root });
    const { stdout: commitHash } = await execa('git', ['commit-tree', treeHash.trim(), '-m', 'Update intent commits'], {
      cwd: root,
    });

    await git.cwd(root).raw(['update-ref', `${this.REFS_PREFIX}/commits`, commitHash.trim()]);
    await fs.writeJSON(commitsFile, data, { spaces: 2 });
  }

  async saveCommits(commits: IntentionalCommit[]): Promise<void> {
    const data: StorageData = {
      version: getPackageInfo().version,
      commits,
    };

    await this.saveCommitsData(data);
  }

  async addCommit(commit: Omit<IntentionalCommit, 'id'>): Promise<string> {
    const currentCommits = await this.loadCommits();
    const newCommitId = generateId(8);

    const data: StorageData = {
      version: getPackageInfo().version,
      commits: [...currentCommits, { ...commit, id: newCommitId }],
    };

    await this.saveCommitsData(data);

    return newCommitId;
  }

  async updateCommitMessage(id: string, message: IntentionalCommit['message']): Promise<void> {
    const currentCommits = await this.loadCommits();

    const existingCommit = currentCommits.find((c) => c.id === id);
    if (!existingCommit) {
      throw new Error('Commit not found');
    }

    const data: StorageData = {
      version: getPackageInfo().version,
      commits: currentCommits.map((c) => (c.id === id ? { ...existingCommit, message } : c)),
    };

    await this.saveCommitsData(data);
  }

  async deleteCommit(id: string): Promise<void> {
    const currentCommits = await this.loadCommits();
    const newCommits = currentCommits.filter((c) => c.id !== id);
    await this.saveCommits(newCommits);
  }

  async clearCommits(): Promise<void> {
    const root = await this.getGitRoot();
    const commitsFile = await this.getCommitsFile();
    await fs.remove(commitsFile);
    await git.cwd(root).raw(['update-ref', '-d', `${this.REFS_PREFIX}/commits`]);
  }

  async initializeRefs(): Promise<void> {
    const root = await this.getGitRoot();
    await checkIsRepo(root);

    try {
      await git.cwd(root).raw(['show-ref', '--verify', `${this.REFS_PREFIX}/commits`]);
    } catch {
      const initialData = this.getInitialData();
      const content = JSON.stringify(initialData, null, 2);

      const { stdout: hash } = await execa('git', ['hash-object', '-w', '--stdin'], { input: content, cwd: root });
      const treeContent = `100644 blob ${hash.trim()}\t${this.storageFilename}\n`;
      const { stdout: treeHash } = await execa('git', ['mktree'], { input: treeContent, cwd: root });
      const { stdout: commitHash } = await execa(
        'git',
        ['commit-tree', treeHash.trim(), '-m', 'Initialize intent commits'],
        { cwd: root }
      );

      await git.cwd(root).raw(['update-ref', `${this.REFS_PREFIX}/commits`, commitHash.trim()]);
    }
  }
}

export const storage = GitIntentionalCommitStorage.getInstance();
