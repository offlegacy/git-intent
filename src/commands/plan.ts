import { storage } from '@/utils/storage.js';
import chalk from 'chalk';
import { Command } from 'commander';
import edit from 'external-editor';

const plan = new Command()
  .command('plan')
  .description('Plan a new intentional commit before starting work')
  .argument('[message]', 'Intent message')
  .action(async (message?: string) => {
    let commitMessage = message;

    if (!commitMessage) {
      const text = edit.edit('', {
        postfix: '.git-intent',
      });
      commitMessage = text.trim();
    }

    if (!commitMessage) {
      console.error('Commit message is required');
      process.exit(1);
    }

    const newCommitId = await storage.addCommit({
      message: commitMessage,
      status: 'created',
      metadata: {
        createdAt: new Date().toISOString(),
      },
    });

    console.log(chalk.green('✓ Intent created:'));
    console.log(`ID: ${chalk.blue(newCommitId)}`);
    console.log(`Message: ${commitMessage}`);
  });

export default plan;
