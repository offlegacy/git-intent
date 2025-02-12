import { Command } from 'commander';

export const start = new Command()
  .name('start')
  .description('Start the todo list')
  .action(() => {});
