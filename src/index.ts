#!/usr/bin/env node

import { Command } from 'commander';
import { add } from './commands/add';
import { edit } from './commands/edit';
import { finish } from './commands/finish';
import { list } from './commands/list';
import { remove } from './commands/remove';
import { show } from './commands/show';
import { getPackageInfo } from './utils/get-package-info';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

async function main() {
  const packageInfo = getPackageInfo();

  new Command()
    .name('intent')
    .description(packageInfo.description)
    .version(packageInfo.version, '-v, --version')
    .addCommand(add)
    .addCommand(show)
    .addCommand(edit)
    .addCommand(remove)
    .addCommand(list)
    .addCommand(finish)
    .parse();
}

main();
