import { execa } from 'execa';
import { nanoid } from 'nanoid';
import simpleGit from 'simple-git';

export const git = simpleGit();

const REFS_PATH = 'refs/local/intentional-commits';
const REFS_COMMITS_PATH = `${REFS_PATH}/commits`;

export interface IntentionalCommit {
  id: string;
  message: string;
  createdAt: string;
  completedAt?: string;
}

export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitError';
  }
}

export async function initializeRefs(): Promise<void> {
  try {
    await git.raw(['show-ref', REFS_PATH]);
  } catch {
    const emptyHash = await createBlob('');
    await git.raw(['update-ref', `${REFS_PATH}/HEAD`, emptyHash, '0000000000000000000000000000000000000000']);
  }
}

export async function getCurrentBranch(): Promise<string> {
  const result = await git.branch();
  return result.current;
}

async function createBlob(content: string): Promise<string> {
  const { stdout } = await execa('git', ['hash-object', '-w', '--stdin'], { input: content });
  return stdout.trim();
}

/**
 * ref를 생성합니다.
 */
async function createRef(path: string, hash: string): Promise<void> {
  await git.raw(['update-ref', path, hash, '0000000000000000000000000000000000000000']);
}

/**
 * ref를 업데이트합니다.
 */
async function updateRef(path: string, hash: string): Promise<void> {
  await git.raw(['update-ref', path, hash]);
}

/**
 * ref의 해시값을 가져옵니다.
 */
async function getRefHash(path: string): Promise<string> {
  const result = await git.raw(['show-ref', path]);
  return result.split(' ')[0];
}

/**
 * blob의 내용을 가져옵니다.
 */
async function getBlobContent(hash: string): Promise<string> {
  return git.raw(['cat-file', '-p', hash]);
}

/**
 * 의도 커밋 목록을 저장합니다.
 */
async function saveCommits(commits: IntentionalCommit[], branch: string): Promise<void> {
  const content = JSON.stringify(commits, null, 2);
  const hash = await createBlob(content);
  const refPath = `${REFS_COMMITS_PATH}/${branch}`;

  try {
    await getRefHash(refPath);
    await updateRef(refPath, hash);
  } catch {
    await createRef(refPath, hash);
  }
}

/**
 * 의도 커밋 목록을 가져옵니다.
 */
async function loadCommits(branch: string): Promise<IntentionalCommit[]> {
  try {
    const refPath = `${REFS_COMMITS_PATH}/${branch}`;
    const hash = await getRefHash(refPath);
    const content = await getBlobContent(hash);
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * 새로운 의도 커밋을 추가합니다.
 */
export async function addIntentionalCommit(message: string, branchName?: string): Promise<void> {
  const branch = branchName || (await getCurrentBranch());
  const commits = await loadCommits(branch);

  commits.push({
    id: nanoid(8),
    message,
    createdAt: new Date().toISOString(),
  });

  await saveCommits(commits, branch);
}

/**
 * 의도 커밋을 완료 처리합니다.
 */
export async function completeIntentionalCommit(id: string, branchName?: string): Promise<void> {
  const branch = branchName || (await getCurrentBranch());
  const commits = await loadCommits(branch);
  const commit = commits.find((c) => c.id === id);

  if (!commit) {
    throw new GitError('Intentional commit not found');
  }

  commit.completedAt = new Date().toISOString();
  await saveCommits(commits, branch);
}

/**
 * 의도 커밋을 삭제합니다.
 */
export async function deleteIntentionalCommit(id: string, branchName?: string): Promise<void> {
  const branch = branchName || (await getCurrentBranch());
  const commits = await loadCommits(branch);
  const filteredCommits = commits.filter((c) => c.id !== id);

  await saveCommits(filteredCommits, branch);
}

/**
 * 의도 커밋 목록을 가져옵니다.
 */
export async function getIntentionalCommits(branchName?: string): Promise<IntentionalCommit[]> {
  const branch = branchName || (await getCurrentBranch());
  return loadCommits(branch);
}

/**
 * 완료되지 않은 의도 커밋 목록을 가져옵니다.
 */
export async function getUncompletedIntentionalCommits(): Promise<IntentionalCommit[]> {
  const commits = await getIntentionalCommits();
  return commits.filter((commit) => !commit.completedAt);
}

/**
 * 변경된 파일이 있는지 확인합니다.
 */
export async function hasChangedFiles(): Promise<boolean> {
  const status = await git.status();
  return status.modified.length > 0 || status.not_added.length > 0;
}

/**
 * 스테이징된 파일이 있는지 확인합니다.
 */
export async function hasStagedFiles(): Promise<boolean> {
  const status = await git.status();
  return status.staged.length > 0;
}
