import path from 'node:path';
import { execa } from 'execa';
import fs from 'fs-extra';
import git from './git.js';
import { checkIsRepo } from './git.js';

export interface IntentionalCommit {
  id: string;
  message: string;
  status: 'created' | 'in_progress';
  metadata: {
    createdAt: string;
    startedAt?: string;
    branch?: string;
  };
}

const REFS_PREFIX = 'refs/intentional-commits';
const STORAGE_FILE = 'intents.json';
const GIT_DIR = '.git';
const COMMITS_DIR = path.join(GIT_DIR, 'intentional-commits');
const COMMITS_FILE = path.join(COMMITS_DIR, 'commits.json');

async function ensureCommitsDir(): Promise<void> {
  await fs.ensureDir(COMMITS_DIR);
  try {
    await fs.access(COMMITS_FILE);
  } catch {
    await fs.writeJSON(COMMITS_FILE, []);
  }
}

export async function loadCommits(): Promise<IntentionalCommit[]> {
  await checkIsRepo();
  await ensureCommitsDir();

  try {
    const result = await git.show(`${REFS_PREFIX}/commits:${STORAGE_FILE}`);
    return JSON.parse(result);
  } catch {
    return fs.readJSON(COMMITS_FILE);
  }
}

export async function saveCommits(commits: IntentionalCommit[]): Promise<void> {
  const content = JSON.stringify(commits, null, 2);

  const { stdout: hash } = await execa('git', ['hash-object', '-w', '--stdin'], { input: content });
  const treeContent = `100644 blob ${hash.trim()}\t${STORAGE_FILE}\n`;
  const { stdout: treeHash } = await execa('git', ['mktree'], { input: treeContent });
  const { stdout: commitHash } = await execa('git', ['commit-tree', treeHash.trim(), '-m', 'Update intent commits']);

  await git.raw(['update-ref', `${REFS_PREFIX}/commits`, commitHash.trim()]);
  await fs.writeJSON(COMMITS_FILE, commits, { spaces: 2 });
}

export async function initializeRefs(): Promise<void> {
  await checkIsRepo();

  try {
    await git.raw(['show-ref', '--verify', `${REFS_PREFIX}/commits`]);
  } catch {
    const emptyTree = await git.raw(['hash-object', '-t', 'tree', '/dev/null']);
    await git.raw(['update-ref', `${REFS_PREFIX}/commits`, emptyTree.trim()]);
  }
}
