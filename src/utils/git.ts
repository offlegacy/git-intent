import { simpleGit } from 'simple-git';

export const createGit = (cwd?: string) => simpleGit(cwd);

export async function checkIsRepo(cwd?: string): Promise<void> {
  const git = createGit(cwd);
  try {
    await git.checkIsRepo();
  } catch {
    throw new Error('Not a git repository');
  }
}

export async function getCurrentBranch(cwd?: string): Promise<string> {
  const git = createGit(cwd);
  const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
  return branch.trim();
}

export async function hasStagedFiles(cwd?: string): Promise<boolean> {
  const git = createGit(cwd);
  const status = await git.status();
  return status.staged.length > 0;
}

export async function createCommit(message: string, cwd?: string): Promise<string> {
  const git = createGit(cwd);
  const result = await git.commit(message);
  return result.commit;
}

export async function getStatus(cwd?: string): Promise<string> {
  const git = createGit(cwd);
  const status = await git.status();
  return JSON.stringify(status, null, 2);
}

export default createGit();
