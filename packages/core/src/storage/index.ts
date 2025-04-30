export * from './types.js';
import { GitIntentionalCommitStorage } from './git-storage.js';
import type { StorageConfig } from './types.js';

export const storage = GitIntentionalCommitStorage.getInstance();

export function createStorage(config?: Partial<StorageConfig>) {
  return GitIntentionalCommitStorage.getInstance(config);
}
