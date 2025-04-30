import type { EventMap } from '../events/index.js';
import type { IntentionalCommit } from '../types/intent.js';

export interface IntentStorage {
  loadCommits(): Promise<IntentionalCommit[]>;
  saveCommits(commits: IntentionalCommit[]): Promise<void>;
  addCommit(commit: Omit<IntentionalCommit, 'id'>): Promise<string>;
  updateCommitMessage(id: string, message: IntentionalCommit['message']): Promise<void>;
  updateCommitStatus(
    id: string,
    status: IntentionalCommit['status'],
    metadata?: Partial<IntentionalCommit['metadata']>
  ): Promise<void>;
  deleteCommit(id: string): Promise<void>;
  clearCommits(): Promise<void>;
  initializeRefs(): Promise<void>;
}

export interface StorageConfig {
  storageFilename: string;
  refsPrefix: string;
  gitDir: string;
}

export interface StorageEvents extends EventMap {
  'commit:added': IntentionalCommit;
  'commit:updated': IntentionalCommit;
  'commit:deleted': IntentionalCommit;
  'commit:status-changed': {
    commit: IntentionalCommit;
    previousStatus: IntentionalCommit['status'];
    newStatus: IntentionalCommit['status'];
  };
  'commits:saved': { version: string; commits: IntentionalCommit[] };
  'commits:cleared': null;
  'refs:initialized': null;
}
