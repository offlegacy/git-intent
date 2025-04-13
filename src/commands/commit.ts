import { storage } from '@/utils/storage.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { execa } from 'execa';

const commit = new Command()
  .command('commit')
  .description('Complete current intention and commit')
  .option('-m, --message <message>', 'Additional commit message')
  .action(async (options) => {
    const commits = await storage.loadCommits();
    const currentCommit = commits.find((c) => c.status === 'in_progress');

    if (!currentCommit) {
      console.log('No active intention');
      return;
    }

    const message = options.message ? `${currentCommit.message}\n\n${options.message}` : currentCommit.message;

    await execa('git', ['commit', '-m', message]);
    await storage.deleteCommit(currentCommit.id);

    console.log(chalk.green('✓ Intention completed and committed'));
  });

export default commit;
