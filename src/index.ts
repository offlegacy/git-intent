#!/usr/bin/env node
import { program } from 'commander';
import * as command from './commands/index.js';
import { storage } from './utils/storage.js';

(async () => {
  await storage.initializeRefs();

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
