import { storage } from '@git-intent/core';
import chalk from 'chalk';
import { Command } from 'commander';

const list = new Command()
  .command('list')
  .alias('ls')
  .description('List all intentions')
  .action(async () => {
    const commits = await storage.loadCommits();

    if (commits.length === 0) {
      console.log('No intentions found');
      return;
    }

    console.log(chalk.blue('Intentions:'));
    console.log('');

    for (const commit of commits) {
      const status = commit.status === 'in_progress' ? chalk.green('[IN PROGRESS]') : chalk.yellow('[CREATED]');
      console.log(`${status} ${chalk.blue(commit.id)} - ${commit.message}`);

      if (commit.metadata.createdAt) {
        console.log(`  Created: ${new Date(commit.metadata.createdAt).toLocaleString()}`);
      }

      if (commit.metadata.startedAt) {
        console.log(`  Started: ${new Date(commit.metadata.startedAt).toLocaleString()}`);
      }

      console.log('');
    }
  });

export default list;
