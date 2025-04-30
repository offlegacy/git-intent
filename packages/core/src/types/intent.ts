export type IntentStatus = 'created' | 'in_progress' | 'completed' | 'cancelled';

export type IntentionalCommit = {
  id: string;
  message: string;
  status: IntentStatus;
  metadata: {
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    branch?: string;
    author?: string;
    tags?: string[];
  };
};

export type StorageData = {
  version: string;
  commits: IntentionalCommit[];
};
