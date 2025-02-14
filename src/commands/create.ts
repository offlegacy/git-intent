import { type IntentionalCommit, loadCommits, saveCommits } from '@/utils/storage.js';
import chalk from 'chalk';
import { Command } from 'commander';
import edit from 'external-editor';
import { nanoid } from 'nanoid';

const create = new Command()
  .command('create')
  .description('Create a new intentional commit')
  .argument('[message]', 'Commit message')
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

    const commits = await loadCommits();

    const newCommit: IntentionalCommit = {
      id: nanoid(8),
      message: commitMessage,
      status: 'created',
      metadata: {
        createdAt: new Date().toISOString(),
      },
    };

    commits.push(newCommit);
    await saveCommits(commits);

    console.log(chalk.green('✓ Intent created:'));
    console.log(`ID: ${chalk.blue(newCommit.id)}`);
    console.log(`Message: ${newCommit.message}`);
  });

export default create;
