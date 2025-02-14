#!/usr/bin/env node
import { Command } from 'commander';
import { create, finish, list, remove, start, status } from './commands/index.js';
import { initializeRefs } from './utils/storage.js';

(async () => {
  const program = new Command();

  await initializeRefs();

  program
    .name('gintent')
    .description('Git workflow tool for intentional commits')
    .version('0.0.0')
    .addCommand(create)
    .addCommand(list)
    .addCommand(remove)
    .addCommand(start)
    .addCommand(status)
    .addCommand(finish);

  program.parse();
})();
