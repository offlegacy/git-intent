import path from 'node:path';
import fs from 'fs-extra';
import type { IntentionalCommit, StorageData } from '../types/intent.js';
import { generateId } from './generateId.js';
import { getPackageInfo } from './get-package-info.js';
import { gitRefs } from './git-refs.js';
import { git } from './git.js';

export class GitIntentionalCommitStorage {
  private static instance: GitIntentionalCommitStorage;
  private readonly REFS_PREFIX = 'refs/intentional-commits';
  private storageFilename: string;
  private readonly GIT_DIR = '.git';
  private gitRootCache: string | undefined;

  private constructor(storageFilename = 'intents.json') {
    this.storageFilename = storageFilename;
  }

  static getInstance(): GitIntentionalCommitStorage {
    if (!GitIntentionalCommitStorage.instance) {
      GitIntentionalCommitStorage.instance = new GitIntentionalCommitStorage();
    }
    return GitIntentionalCommitStorage.instance;
  }

  async getGitRoot(): Promise<string> {
    if (this.gitRootCache) return this.gitRootCache;

    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error('Error: git-intent can only be used within a Git repository.');
      console.error('Please check if the current directory is a Git repository or initialize one with `git init`.');
      process.exit(1);
    }

    this.gitRootCache = await git.getRepoRoot();
    return this.gitRootCache;
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

  private migrateData(data: any): StorageData {
    return data;
  }

  async loadCommits(): Promise<IntentionalCommit[]> {
    const root = await this.getGitRoot();
    await this.ensureCommitsDir();

    try {
      const result = await gitRefs.showRef(`${this.REFS_PREFIX}/commits:${this.storageFilename}`, root);
      const data = this.migrateData(JSON.parse(result));
      return data.commits;
    } catch {
      const commitsFile = await this.getCommitsFile();
      const data = this.migrateData(await fs.readJSON(commitsFile));
      return data.commits;
    }
  }

  private async saveCommitsData(data: StorageData): Promise<void> {
    const root = await this.getGitRoot();
    const commitsFile = await this.getCommitsFile();
    const content = JSON.stringify(data, null, 2);

    const hash = await git.hashObject(content, root);
    const treeContent = `100644 blob ${hash}\t${this.storageFilename}\n`;
    const treeHash = await gitRefs.createTree(treeContent, root);
    const commitHash = await gitRefs.createCommitTree(treeHash, 'Update intent commits', root);

    await gitRefs.updateRef(`${this.REFS_PREFIX}/commits`, commitHash, root);
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
    const newCommit = { ...commit, id: newCommitId };

    const data: StorageData = {
      version: getPackageInfo().version,
      commits: [...currentCommits, newCommit],
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
    await gitRefs.deleteRef(`${this.REFS_PREFIX}/commits`, root);
  }

  async initializeRefs(): Promise<void> {
    const root = await this.getGitRoot();

    const isRepo = await git.checkIsRepo(root);
    if (!isRepo) {
      console.error('Error: git-intent can only be used within a Git repository.');
      console.error('Please check if the current directory is a Git repository or initialize one with `git init`.');
      process.exit(1);
    }

    const refExists = await gitRefs.checkRefExists(`${this.REFS_PREFIX}/commits`, root);
    if (refExists) {
      return;
    }

    const initialData = this.getInitialData();
    const content = JSON.stringify(initialData, null, 2);

    const hash = await git.hashObject(content, root);
    const treeContent = `100644 blob ${hash}\t${this.storageFilename}\n`;
    const treeHash = await gitRefs.createTree(treeContent, root);
    const commitHash = await gitRefs.createCommitTree(treeHash, 'Initialize intent commits', root);

    if (!commitHash || commitHash.trim() === '') {
      throw new Error('Failed to create commit: commit hash is empty');
    }

    await gitRefs.updateRef(`${this.REFS_PREFIX}/commits`, commitHash, root);
  }
}

export const storage = GitIntentionalCommitStorage.getInstance();
