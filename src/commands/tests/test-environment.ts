import os from 'node:os';
import path from 'node:path';
import { storage } from '@/utils/storage.js';
import fs from 'fs-extra';
import execa from 'execa';

class TestEnvironment {
  private static instance: TestEnvironment;
  private _tmpDir: string | null = null;

  private constructor() {}

  static getInstance(): TestEnvironment {
    if (!TestEnvironment.instance) {
      TestEnvironment.instance = new TestEnvironment();
    }
    return TestEnvironment.instance;
  }

  get tmpDir(): string {
    if (!this._tmpDir) {
      throw new Error('Test environment not initialized. Run `setup()` first.');
    }
    return this._tmpDir;
  }

  async setup() {
    if (this._tmpDir) {
      return this._tmpDir;
    }

    console.log('Setting up test environment...');
    this._tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'git-todo-test-'));

    await execa('git', ['init'], { cwd: this._tmpDir });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: this._tmpDir });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: this._tmpDir });
    await execa('npm', ['init', '-y'], { cwd: this._tmpDir });

    await fs.writeFile(path.join(this._tmpDir, 'README.md'), '# Test Repository');
    await execa('git', ['add', 'README.md'], { cwd: this._tmpDir });
    await execa('git', ['commit', '-m', 'Initial commit'], { cwd: this._tmpDir });

    storage.setGitRoot(this._tmpDir);

    return this._tmpDir;
  }

  async cleanup() {
    if (this._tmpDir) {
      await execa('git', ['reset', '--hard', 'HEAD'], { cwd: this._tmpDir });
      await execa('git', ['clean', '-fd'], { cwd: this._tmpDir });

      await storage.clearCommits();
      await fs.remove(this._tmpDir);
      this._tmpDir = null;
    }
  }
}

export const testEnvironment = TestEnvironment.getInstance();
