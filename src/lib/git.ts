import { execa } from 'execa';
import { nanoid } from 'nanoid';
import simpleGit from 'simple-git';

export const git = simpleGit();

export interface IntentionalCommit {
  id: string;
  message: string;
  status: 'created' | 'in_progress' | 'completed';
  metadata: {
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    branch?: string;
    commitHash?: string;
  };
}

const REFS_PREFIX = 'refs/intentional-commits';
const STORAGE_FILE = 'intents.json';

export async function initializeRefs() {
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error('Not a git repository');
  }

  try {
    await git.raw(['show-ref', '--verify', `${REFS_PREFIX}/commits`]);
  } catch {
    const emptyTree = await git.raw(['hash-object', '-t', 'tree', '/dev/null']);
    await git.raw(['update-ref', `${REFS_PREFIX}/commits`, emptyTree.trim()]);
  }
}

export async function hasStagedFiles(): Promise<boolean> {
  const status = await git.status();
  return status.staged.length > 0;
}

export async function getCurrentBranch(): Promise<string> {
  const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
  return branch.trim();
}

export async function loadCommits(filename = STORAGE_FILE): Promise<IntentionalCommit[]> {
  try {
    const result = await git.show(`${REFS_PREFIX}/commits:${filename}`);

    return JSON.parse(result);
  } catch {
    return [];
  }
}

export async function saveCommits(commits: IntentionalCommit[], filename = STORAGE_FILE) {
  const content = JSON.stringify(commits, null, 2);

  const { stdout: hash } = await execa('git', ['hash-object', '-w', '--stdin'], { input: content });

  const treeContent = `100644 blob ${hash.trim()}\t${filename}\n`;
  const { stdout: treeHash } = await execa('git', ['mktree'], { input: treeContent });

  const { stdout: commitHash } = await execa('git', ['commit-tree', treeHash.trim(), '-m', 'Update intent commits']);

  await git.raw(['update-ref', `${REFS_PREFIX}/commits`, commitHash.trim()]);
}

export async function createIntentionalCommit(message: string): Promise<IntentionalCommit> {
  const commits = await loadCommits();

  const newCommit: IntentionalCommit = {
    id: nanoid(8),
    message,
    status: 'created',
    metadata: {
      createdAt: new Date().toISOString(),
    },
  };

  commits.push(newCommit);
  await saveCommits(commits);

  return newCommit;
}

export async function startIntentionalCommit(id: string, branch?: string): Promise<IntentionalCommit> {
  const commits = await loadCommits();
  const commit = commits.find((c) => c.id === id);

  if (!commit) {
    throw new Error('Commit not found');
  }

  if (commit.status !== 'created') {
    throw new Error('Commit is not in created status');
  }

  const currentBranch = branch || (await getCurrentBranch());

  commit.status = 'in_progress';
  commit.metadata.startedAt = new Date().toISOString();
  commit.metadata.branch = currentBranch;

  await saveCommits(commits);

  return commit;
}

export async function finishIntentionalCommit(id: string, branch?: string): Promise<IntentionalCommit> {
  const commits = await loadCommits();
  const commit = commits.find((c) => c.id === id);

  if (!commit) {
    throw new Error('Commit not found');
  }

  if (commit.status !== 'in_progress') {
    throw new Error('Commit is not in progress');
  }

  const currentBranch = branch || (await getCurrentBranch());
  if (commit.metadata.branch !== currentBranch) {
    throw new Error('Current branch does not match the branch where this intent was started');
  }

  const head = await git.revparse(['HEAD']);

  commit.status = 'completed';
  commit.metadata.completedAt = new Date().toISOString();
  commit.metadata.commitHash = head.trim();

  await saveCommits(commits);

  await git.commit(['-m', commit.message]);

  return commit;
}

export async function getInProgressCommit(branch?: string): Promise<IntentionalCommit | undefined> {
  const commits = await loadCommits();
  const currentBranch = branch || (await getCurrentBranch());

  return commits.find((commit) => commit.status === 'in_progress' && commit.metadata.branch === currentBranch);
}

export async function getCreatedCommits(): Promise<IntentionalCommit[]> {
  const commits = await loadCommits();
  return commits.filter((commit) => commit.status === 'created');
}
