import path from 'node:path';
import fs from 'fs-extra';
import { GitError, GitIntentError } from '../errors/index.js';
import { type TypedEventEmitter, createEmitter } from '../events/index.js';
import { gitService } from '../git/index.js';
import { gitRefs } from '../git/refs.js';
import type { IntentionalCommit, StorageData } from '../types/intent.js';
import { generateId } from '../utils/generateId.js';
import { getPackageInfo } from '../utils/get-package-info.js';
import type { IntentStorage, StorageConfig, StorageEvents } from './types.js';

export class GitIntentionalCommitStorage implements IntentStorage {
  private static instance: GitIntentionalCommitStorage;
  private readonly eventEmitter: TypedEventEmitter<StorageEvents>;
  private readonly config: StorageConfig;
  private gitRootCache: string | undefined;

  private constructor(config?: Partial<StorageConfig>) {
    this.config = {
      storageFilename: 'intents.json',
      refsPrefix: 'refs/intentional-commits',
      gitDir: '.git',
      ...config,
    };
    this.eventEmitter = createEmitter<StorageEvents>();
  }

  static getInstance(config?: Partial<StorageConfig>): GitIntentionalCommitStorage {
    if (!GitIntentionalCommitStorage.instance) {
      GitIntentionalCommitStorage.instance = new GitIntentionalCommitStorage(config);
    }
    return GitIntentionalCommitStorage.instance;
  }

  on<K extends keyof StorageEvents>(event: K, handler: (data: StorageEvents[K]) => void): void {
    this.eventEmitter.on(event, handler);
  }

  off<K extends keyof StorageEvents>(event: K, handler?: (data: StorageEvents[K]) => void): void {
    this.eventEmitter.off(event, handler);
  }

  async getGitRoot(cwd?: string): Promise<string> {
    if (this.gitRootCache) return this.gitRootCache;

    try {
      const isRepo = await gitService.checkIsRepo(cwd);
      if (!isRepo) {
        throw new GitIntentError(
          'git-intent can only be used within a Git repository. Please check if the current directory is a Git repository or initialize one with `git init`.',
          'NOT_GIT_REPO'
        );
      }

      this.gitRootCache = await gitService.getRepoRoot(cwd);
      return this.gitRootCache;
    } catch (error) {
      if (error instanceof GitError || error instanceof GitIntentError) {
        throw error;
      }
      throw new GitIntentError(`Failed to get Git repository root: ${(error as Error).message}`, 'GIT_ROOT_ERROR');
    }
  }

  private async getCommitsDir(cwd?: string): Promise<string> {
    const root = await this.getGitRoot(cwd);
    return path.join(root, this.config.gitDir, 'intentional-commits');
  }

  private async getCommitsFile(cwd?: string): Promise<string> {
    const commitsDir = await this.getCommitsDir(cwd);
    return path.join(commitsDir, 'commits.json');
  }

  private getInitialData(): StorageData {
    return {
      version: getPackageInfo().version,
      commits: [],
    };
  }

  private async ensureCommitsDir(cwd?: string): Promise<void> {
    try {
      const commitsDir = await this.getCommitsDir(cwd);
      const commitsFile = await this.getCommitsFile(cwd);

      await fs.ensureDir(commitsDir);
      try {
        await fs.access(commitsFile);
      } catch {
        await fs.writeJSON(commitsFile, this.getInitialData());
      }
    } catch (error) {
      throw new GitIntentError(`Failed to ensure commits directory: ${(error as Error).message}`, 'ENSURE_DIR_ERROR');
    }
  }

  async loadCommits(cwd?: string): Promise<IntentionalCommit[]> {
    try {
      const root = await this.getGitRoot(cwd);
      await this.ensureCommitsDir(cwd);

      try {
        const result = await gitRefs.showRef(`${this.config.refsPrefix}/commits:${this.config.storageFilename}`, root);
        const data = JSON.parse(result);
        return data.commits;
      } catch (error) {
        const commitsFile = await this.getCommitsFile(cwd);
        try {
          const data = await fs.readJSON(commitsFile);
          return data.commits;
        } catch (fileError) {
          throw new GitIntentError(
            `Failed to load commits from file: ${(fileError as Error).message}`,
            'LOAD_COMMITS_ERROR'
          );
        }
      }
    } catch (error) {
      if (error instanceof GitIntentError) {
        throw error;
      }
      throw new GitIntentError(`Failed to load commits: ${(error as Error).message}`, 'LOAD_COMMITS_ERROR');
    }
  }

  private async saveCommitsData(data: StorageData): Promise<void> {
    try {
      const root = await this.getGitRoot();
      const commitsFile = await this.getCommitsFile();
      const content = JSON.stringify(data, null, 2);

      const hash = await gitService.hashObject(content, root);
      const treeContent = `100644 blob ${hash}\t${this.config.storageFilename}\n`;
      const treeHash = await gitRefs.createTree(treeContent, root);
      const commitHash = await gitRefs.createCommitTree(treeHash, 'Update intent commits', root);

      await gitRefs.updateRef(`${this.config.refsPrefix}/commits`, commitHash, root);
      await fs.writeJSON(commitsFile, data, { spaces: 2 });

      this.eventEmitter.emit('commits:saved', data);
    } catch (error) {
      throw new GitIntentError(`Failed to save commits data: ${(error as Error).message}`, 'SAVE_COMMITS_ERROR');
    }
  }

  async saveCommits(commits: IntentionalCommit[]): Promise<void> {
    try {
      const data: StorageData = {
        version: getPackageInfo().version,
        commits,
      };

      await this.saveCommitsData(data);
    } catch (error) {
      if (error instanceof GitIntentError) {
        throw error;
      }
      throw new GitIntentError(`Failed to save commits: ${(error as Error).message}`, 'SAVE_COMMITS_ERROR');
    }
  }

  async addCommit(commit: Omit<IntentionalCommit, 'id'>): Promise<string> {
    try {
      const currentCommits = await this.loadCommits();
      const newCommitId = generateId(8);
      const newCommit = { ...commit, id: newCommitId };

      const data: StorageData = {
        version: getPackageInfo().version,
        commits: [...currentCommits, newCommit],
      };

      await this.saveCommitsData(data);

      this.eventEmitter.emit('commit:added', newCommit);

      return newCommitId;
    } catch (error) {
      if (error instanceof GitIntentError) {
        throw error;
      }
      throw new GitIntentError(`Failed to add commit: ${(error as Error).message}`, 'ADD_COMMIT_ERROR');
    }
  }

  async updateCommitMessage(id: string, message: IntentionalCommit['message']): Promise<void> {
    try {
      const currentCommits = await this.loadCommits();

      const existingCommit = currentCommits.find((c) => c.id === id);
      if (!existingCommit) {
        throw new GitIntentError('Commit not found', 'COMMIT_NOT_FOUND');
      }

      const updatedCommit = { ...existingCommit, message };

      const data: StorageData = {
        version: getPackageInfo().version,
        commits: currentCommits.map((c) => (c.id === id ? updatedCommit : c)),
      };

      await this.saveCommitsData(data);

      this.eventEmitter.emit('commit:updated', updatedCommit);
    } catch (error) {
      if (error instanceof GitIntentError) {
        throw error;
      }
      throw new GitIntentError(`Failed to update commit message: ${(error as Error).message}`, 'UPDATE_COMMIT_ERROR');
    }
  }

  async updateCommitStatus(
    id: string,
    status: IntentionalCommit['status'],
    metadata?: Partial<IntentionalCommit['metadata']>
  ): Promise<void> {
    try {
      const currentCommits = await this.loadCommits();

      const existingCommit = currentCommits.find((c) => c.id === id);
      if (!existingCommit) {
        throw new GitIntentError('Commit not found', 'COMMIT_NOT_FOUND');
      }

      const updatedMetadata = { ...existingCommit.metadata };

      if (status === 'in_progress' && !updatedMetadata.startedAt) {
        updatedMetadata.startedAt = new Date().toISOString();
      } else if (status === 'completed' && !updatedMetadata.completedAt) {
        updatedMetadata.completedAt = new Date().toISOString();
      } else if (status === 'cancelled' && !updatedMetadata.cancelledAt) {
        updatedMetadata.cancelledAt = new Date().toISOString();
      }

      if (metadata) {
        Object.assign(updatedMetadata, metadata);
      }

      const updatedCommit = {
        ...existingCommit,
        status,
        metadata: updatedMetadata,
      };

      const data: StorageData = {
        version: getPackageInfo().version,
        commits: currentCommits.map((c) => (c.id === id ? updatedCommit : c)),
      };

      await this.saveCommitsData(data);

      this.eventEmitter.emit('commit:status-changed', {
        commit: updatedCommit,
        previousStatus: existingCommit.status,
        newStatus: status,
      });
    } catch (error) {
      if (error instanceof GitIntentError) {
        throw error;
      }
      throw new GitIntentError(`Failed to update commit status: ${(error as Error).message}`, 'UPDATE_STATUS_ERROR');
    }
  }

  async deleteCommit(id: string): Promise<void> {
    try {
      const currentCommits = await this.loadCommits();
      const commitToDelete = currentCommits.find((c) => c.id === id);

      if (!commitToDelete) {
        throw new GitIntentError('Commit not found', 'COMMIT_NOT_FOUND');
      }

      const newCommits = currentCommits.filter((c) => c.id !== id);
      await this.saveCommits(newCommits);

      this.eventEmitter.emit('commit:deleted', commitToDelete);
    } catch (error) {
      if (error instanceof GitIntentError) {
        throw error;
      }
      throw new GitIntentError(`Failed to delete commit: ${(error as Error).message}`, 'DELETE_COMMIT_ERROR');
    }
  }

  async clearCommits(): Promise<void> {
    try {
      const root = await this.getGitRoot();
      const commitsFile = await this.getCommitsFile();
      await fs.remove(commitsFile);
      await gitRefs.deleteRef(`${this.config.refsPrefix}/commits`, root);

      this.eventEmitter.emit('commits:cleared', null);
    } catch (error) {
      throw new GitIntentError(`Failed to clear commits: ${(error as Error).message}`, 'CLEAR_COMMITS_ERROR');
    }
  }

  async initializeRefs(cwd?: string): Promise<void> {
    try {
      const root = await this.getGitRoot(cwd);

      const isRepo = await gitService.checkIsRepo(root);
      if (!isRepo) {
        throw new GitIntentError(
          'git-intent can only be used within a Git repository. Please check if the current directory is a Git repository or initialize one with `git init`.',
          'NOT_GIT_REPO'
        );
      }

      const refExists = await gitRefs.checkRefExists(`${this.config.refsPrefix}/commits`, root);
      if (refExists) {
        return;
      }

      const initialData = this.getInitialData();
      const content = JSON.stringify(initialData, null, 2);

      const hash = await gitService.hashObject(content, root);
      const treeContent = `100644 blob ${hash}\t${this.config.storageFilename}\n`;
      const treeHash = await gitRefs.createTree(treeContent, root);
      const commitHash = await gitRefs.createCommitTree(treeHash, 'Initialize intent commits', root);

      if (!commitHash || commitHash.trim() === '') {
        throw new GitIntentError('Failed to create commit: commit hash is empty', 'EMPTY_COMMIT_HASH');
      }

      await gitRefs.updateRef(`${this.config.refsPrefix}/commits`, commitHash, root);

      this.eventEmitter.emit('refs:initialized', null);
    } catch (error) {
      if (error instanceof GitIntentError) {
        throw error;
      }
      throw new GitIntentError(`Failed to initialize refs: ${(error as Error).message}`, 'INIT_REFS_ERROR');
    }
  }
}
