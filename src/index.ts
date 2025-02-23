#!/usr/bin/env node
import { Command } from 'commander';
import { cancel, create, finish, list, remove, start, status } from './commands/index.js';
import { getPackageInfo } from './utils/get-package-info.js';
import { storage } from './utils/storage.js';

(async () => {
  const program = new Command();

  await storage.initializeRefs();

  const packageInfo = getPackageInfo();

  program
    .name('gintent')
    .description(packageInfo.description)
    .version(packageInfo.version)
    .addCommand(create)
    .addCommand(list)
    .addCommand(remove)
    .addCommand(start)
    .addCommand(status)
    .addCommand(finish)
    .addCommand(cancel);

  program.parse();
})();
