// TODO: 'completed' | 'cancelled'
export type IntentStatus = 'created' | 'in_progress';

export type IntentionalCommit = {
  id: string;
  message: string;
  status: IntentStatus;
  metadata: {
    createdAt: string;
    startedAt?: string;
    // completedAt?: string;
    // cancelledAt?: string;
    branch?: string;
  };
};

export type StorageData = {
  version: string;
  commits: IntentionalCommit[];
};
