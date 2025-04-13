#!/usr/bin/env node
import { Command } from 'commander';
import { create, list, begin, show, commit, cancel, reset, divide } from './commands/index.js';
import { getPackageInfo } from './utils/get-package-info.js';
import { storage } from './utils/storage.js';

(async () => {
  const program = new Command();

  await storage.initializeRefs();

  const packageInfo = getPackageInfo();

  program
    .name('git-intent')
    .description(packageInfo.description)
    .version(packageInfo.version);

  program
    .addCommand(create)
    .addCommand(list)
    .addCommand(begin)
    .addCommand(show)
    .addCommand(commit)
    .addCommand(cancel)
    .addCommand(reset)
    .addCommand(divide);

  program.parse();
})();
