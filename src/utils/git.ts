import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import { simpleGit } from 'simple-git';

function execGit(args: string[], options: { input?: string; cwd?: string } = {}): string {
  const { input, cwd } = options;

  const result = spawnSync('git', args, {
    input: input ? Buffer.from(input) : undefined,
    cwd,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error(`Git command failed: git ${args.join(' ')}\n${result.stderr}`);
  }

  return result.stdout ? result.stdout.trim() : '';
}

export const createGit = (cwd?: string) => simpleGit(cwd);

export async function findGitRoot(startDir: string = process.cwd()): Promise<string> {
  const dir = path.resolve(startDir);
  const gitDir = path.join(dir, '.git');
  if (fs.existsSync(gitDir) && fs.statSync(gitDir).isDirectory()) {
    return dir;
  }

  const parentDir = path.dirname(dir);
  if (parentDir === dir) {
    throw new Error('Not a git repository (or any of the parent directories)');
  }

  return findGitRoot(parentDir);
}

export async function checkIsRepo(cwd?: string): Promise<string> {
  try {
    const git = createGit(cwd);
    await git.checkIsRepo();

    return await findGitRoot(cwd);
  } catch {
    try {
      return await findGitRoot(cwd);
    } catch (error) {
      throw new Error('Not a git repository (or any of the parent directories)');
    }
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

export async function hashObject(content: string, cwd?: string): Promise<string> {
  return execGit(['hash-object', '-w', '--stdin'], { input: content, cwd });
}

export async function createTree(treeContent: string, cwd?: string): Promise<string> {
  if (!treeContent || treeContent.trim() === '') {
    throw new Error('Invalid tree content: tree content cannot be empty');
  }
  return execGit(['mktree'], { input: treeContent, cwd });
}

export async function createCommitTree(treeHash: string, message: string, cwd?: string): Promise<string> {
  if (!treeHash || treeHash.trim() === '') {
    throw new Error('Invalid tree hash: tree hash cannot be empty');
  }

  try {
    const result = execGit(['commit-tree', treeHash, '-m', message], { cwd });

    if (!result || result.trim() === '') {
      throw new Error(`Failed to create commit tree from hash: ${treeHash}`);
    }

    return result;
  } catch (error) {
    console.error('Error creating commit tree:', error);
    throw error;
  }
}

export async function updateRef(refName: string, commitHash: string, cwd?: string): Promise<void> {
  if (!commitHash || commitHash.trim() === '') {
    throw new Error(`Invalid commit hash: commit hash cannot be empty for ref ${refName}`);
  }

  const git = createGit(cwd);
  await git.raw(['update-ref', refName, commitHash]);
}

export async function deleteRef(refName: string, cwd?: string): Promise<void> {
  const git = createGit(cwd);
  await git.raw(['update-ref', '-d', refName]);
}

export async function checkRefExists(refName: string, cwd?: string): Promise<boolean> {
  const git = createGit(cwd);
  try {
    await git.raw(['show-ref', '--verify', refName]);
    return true;
  } catch {
    return false;
  }
}

export default createGit();
