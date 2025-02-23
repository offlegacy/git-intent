import { join } from 'node:path';
import { execa } from 'execa';
import { testEnvironment } from './test-environment';

export const CLI_PATH = join(__dirname, '../../../dist/index.js');

export const runCLI = async (command: string, args: string[]) => {
  return execa('node', [CLI_PATH, command, ...args], {
    cwd: testEnvironment.tmpDir,
  });
};
