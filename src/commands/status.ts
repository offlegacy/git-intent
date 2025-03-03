import { storage } from '@/utils/storage.js';
import chalk from 'chalk';
import { Command } from 'commander';

const status = new Command()
  .command('status')
  .description('Show current intentional commit status')
  .action(async () => {
    const commits = await storage.loadCommits();
    const currentCommit = commits.find((c) => c.status === 'in_progress');

    if (!currentCommit) {
      console.log('No intent in progress');
      return;
    }

    console.log(chalk.blue('\nCurrently working on:'));
    console.log(`ID: ${chalk.blue(currentCommit.id)}`);
    console.log(`Message: ${currentCommit.message}`);

    if (currentCommit.metadata.startedAt) {
      console.log(`Started: ${new Date(currentCommit.metadata.startedAt).toLocaleString()}`);
    }
  });

export default status;
