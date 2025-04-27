import { storage } from '@git-intent/core';
import chalk from 'chalk';
import { Command } from 'commander';

const show = new Command()
  .command('show')
  .description('Show current intention')
  .action(async () => {
    const commits = await storage.loadCommits();
    const currentCommit = commits.find((c) => c.status === 'in_progress');

    if (!currentCommit) {
      console.log('No active intention');
      return;
    }

    console.log(chalk.blue('Current intention:'));
    console.log(`ID: ${chalk.blue(currentCommit.id)}`);
    console.log(`Message: ${currentCommit.message}`);

    if (currentCommit.metadata.createdAt) {
      console.log(`Created: ${new Date(currentCommit.metadata.createdAt).toLocaleString()}`);
    }

    if (currentCommit.metadata.startedAt) {
      console.log(`Started: ${new Date(currentCommit.metadata.startedAt).toLocaleString()}`);
    }
  });

export default show;
