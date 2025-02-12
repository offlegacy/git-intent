import { Command } from 'commander';

export const done = new Command()
  .name('done')
  .description('Mark a task as done')
  .action(() => {});
