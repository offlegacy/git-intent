import path from 'node:path';
import { execa } from 'execa';
import fs from 'fs-extra';
import { getPackageInfo } from './get-package-info.js';
import git, { checkIsRepo } from './git.js';

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

interface StorageData {
  version: string;
  commits: IntentionalCommit[];
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
    const initialData: StorageData = {
      version: getPackageInfo().version,
      commits: [],
    };
    await fs.writeJSON(COMMITS_FILE, initialData);
  }
}

// NOTE: Migrate old data
function migrateData(data: any): StorageData {
  return data;
}

export async function loadCommits(): Promise<IntentionalCommit[]> {
  await checkIsRepo();
  await ensureCommitsDir();

  try {
    const result = await git.show(`${REFS_PREFIX}/commits:${STORAGE_FILE}`);
    const data = migrateData(JSON.parse(result));
    return data.commits;
  } catch {
    const data = migrateData(await fs.readJSON(COMMITS_FILE));
    return data.commits;
  }
}

export async function saveCommits(commits: IntentionalCommit[]): Promise<void> {
  const data: StorageData = {
    version: getPackageInfo().version,
    commits,
  };
  const content = JSON.stringify(data, null, 2);

  const { stdout: hash } = await execa('git', ['hash-object', '-w', '--stdin'], { input: content });
  const treeContent = `100644 blob ${hash.trim()}\t${STORAGE_FILE}\n`;
  const { stdout: treeHash } = await execa('git', ['mktree'], { input: treeContent });
  const { stdout: commitHash } = await execa('git', ['commit-tree', treeHash.trim(), '-m', 'Update intent commits']);

  await git.raw(['update-ref', `${REFS_PREFIX}/commits`, commitHash.trim()]);
  await fs.writeJSON(COMMITS_FILE, data, { spaces: 2 });
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
