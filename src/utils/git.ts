import { execa } from 'execa';
import simpleGit from 'simple-git';

const git = simpleGit();

export async function checkIsRepo(): Promise<void> {
  try {
    await git.checkIsRepo();
  } catch {
    throw new Error('Not a git repository');
  }
}

export async function getCurrentBranch(): Promise<string> {
  const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
  return branch.trim();
}

export async function hasStagedFiles(): Promise<boolean> {
  const status = await git.status();
  return status.staged.length > 0;
}

export async function createCommit(message: string): Promise<string> {
  await git.commit(['-m', message]);
  return git.revparse(['HEAD']);
}

export async function getStatus(): Promise<string> {
  const { stdout } = await execa('git', ['status', '--porcelain']);
  return stdout;
}

export default git;
