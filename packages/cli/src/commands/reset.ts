import { storage } from '@git-intent/core';
import chalk from 'chalk';
import { Command } from 'commander';

const reset = new Command()
  .command('reset')
  .description('Reset all intentions')
  .action(async () => {
    await storage.clearCommits();
    console.log(chalk.green('✓ All intentions have been reset'));
  });

export default reset;
