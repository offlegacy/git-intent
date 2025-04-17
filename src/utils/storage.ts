import path from 'node:path';
import fs from 'fs-extra';
import type { IntentionalCommit, StorageData } from '../types/intent.js';
import { generateId } from './generateId.js';
import { getPackageInfo } from './get-package-info.js';
import git, {
  checkIsRepo,
  hashObject,
  createTree,
  createCommitTree,
  updateRef,
  deleteRef,
  checkRefExists,
} from './git.js';

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

    const hash = await hashObject(content, root);
    const treeContent = `100644 blob ${hash}\t${this.storageFilename}\n`;
    const treeHash = await createTree(treeContent, root);
    const commitHash = await createCommitTree(treeHash, 'Update intent commits', root);

    await updateRef(`${this.REFS_PREFIX}/commits`, commitHash, root);
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
    await deleteRef(`${this.REFS_PREFIX}/commits`, root);
  }

  async initializeRefs(): Promise<void> {
    const root = await this.getGitRoot();
    await checkIsRepo(root);

    const refExists = await checkRefExists(`${this.REFS_PREFIX}/commits`, root);

    if (!refExists) {
      const initialData = this.getInitialData();
      const content = JSON.stringify(initialData, null, 2);

      const hash = await hashObject(content, root);
      const treeContent = `100644 blob ${hash}\t${this.storageFilename}\n`;
      const treeHash = await createTree(treeContent, root);
      const commitHash = await createCommitTree(treeHash, 'Initialize intent commits', root);

      if (!commitHash || commitHash.trim() === '') {
        throw new Error('Failed to create commit: commit hash is empty');
      }

      await updateRef(`${this.REFS_PREFIX}/commits`, commitHash, root);
    }
  }
}

export const storage = GitIntentionalCommitStorage.getInstance();
