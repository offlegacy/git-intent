#!/usr/bin/env node

import { Command } from 'commander';
import { create, finish, list, remove, start, status } from './commands';
import { getPackageInfo } from './utils/get-package-info';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

async function main() {
  const packageInfo = await getPackageInfo();

  new Command()
    .name('intent')
    .description(packageInfo.description)
    .version(packageInfo.version, '-v, --version')
    .addCommand(create)
    .addCommand(start)
    .addCommand(finish)
    .addCommand(list)
    .addCommand(status)
    .addCommand(remove)
    .parse();
}

main().catch((error) => {
  console.error('Failed to start CLI:', error);
  process.exit(1);
});
