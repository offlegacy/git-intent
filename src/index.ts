#!/usr/bin/env node
import { Command } from 'commander';
import * as command from './commands/index.js';
import { getPackageInfo } from './utils/get-package-info.js';
import { storage } from './utils/storage.js';

(async () => {
  const program = new Command();

  await storage.initializeRefs();

  const packageInfo = getPackageInfo();

  program.name('git-intent').description(packageInfo.description).version(packageInfo.version);

  program
    .addCommand(command.add)
    .addCommand(command.list)
    .addCommand(command.start)
    .addCommand(command.show)
    .addCommand(command.commit)
    .addCommand(command.cancel)
    .addCommand(command.reset)
    .addCommand(command.divide)
    .addCommand(command.drop);

  program.parse();
})();
