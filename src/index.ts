#!/usr/bin/env node

import { Command } from 'commander';
import { add } from './commands/add';
import { done } from './commands/done';
import { list } from './commands/list';
import { remove } from './commands/remove';
import { start } from './commands/start';
import { getPackageInfo } from './utils/get-package-info';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

async function main() {
  const packageInfo = getPackageInfo();

  const program = new Command()
    .name('git-todo')
    .description('Commit-Driven Git Workflow')
    .version(packageInfo.version ?? '1.0.0', '-v, --version');

  program.addCommand(add).addCommand(start).addCommand(done).addCommand(remove).addCommand(list);

  program.parse();
}

main();
