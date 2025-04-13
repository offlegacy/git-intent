#!/usr/bin/env node
import { Command } from 'commander';
import { begin, divide, done, drop, list, plan, reset, status, stop } from './commands/index.js';
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
    .addCommand(plan)
    .addCommand(list)
    .addCommand(begin)
    .addCommand(status)
    .addCommand(done)
    .addCommand(drop)
    .addCommand(stop)
    .addCommand(reset)
    .addCommand(divide);

  program.parse();
})();
