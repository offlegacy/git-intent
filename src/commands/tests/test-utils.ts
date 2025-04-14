import { join } from 'node:path';
import execa, { type Options } from 'execa';
import { testEnvironment } from './test-environment';

export const CLI_PATH = join(__dirname, '../../../dist/index.js');

export async function runCLI(command: string, options?: Options): Promise<execa.ExecaChildProcess>;
export async function runCLI(command: string, args: string[], options?: Options): Promise<execa.ExecaChildProcess>;
export async function runCLI(
  command: string,
  argsOrOptions?: string[] | Options,
  options?: Options
): Promise<execa.ExecaChildProcess> {
  const isArrayArgs = Array.isArray(argsOrOptions);
  const execaOptions = isArrayArgs ? options : argsOrOptions;
  const args = isArrayArgs ? argsOrOptions : [];

  return execa('node', [CLI_PATH, command, ...args], {
    cwd: testEnvironment.tmpDir,
    ...execaOptions,
  });
}
