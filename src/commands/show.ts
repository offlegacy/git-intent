import { storage } from '@/utils/storage.js';
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
    console.log(`ID: ${chalk.dim(currentCommit.id)}`);
    console.log(`Message: ${currentCommit.message}`);
    console.log(`Status: ${chalk.yellow(currentCommit.status)}`);
    console.log(`Created at: ${new Date(currentCommit.metadata.createdAt).toLocaleString()}`);
  });

export default show;
