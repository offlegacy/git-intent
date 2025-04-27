import { type IntentionalCommit, storage } from '@git-intent/core';
import chalk from 'chalk';
import { Command } from 'commander';
import prompts from 'prompts';

const cancel = new Command()
  .command('cancel')
  .description('Cancel current intention')
  .action(async () => {
    const commits = await storage.loadCommits();
    const currentCommit = commits.find((c) => c.status === 'in_progress');

    if (!currentCommit) {
      console.log('No active intention');
      return;
    }

    const { action } = await prompts({
      type: 'select',
      name: 'action',
      message: 'What would you like to do with the intent?',
      choices: [
        { title: 'Reset to created status', value: 'reset' },
        { title: 'Delete the intent', value: 'delete' },
      ],
    });

    if (!action) {
      return;
    }

    let updatedCommits: IntentionalCommit[];
    if (action === 'reset') {
      updatedCommits = commits.map((c) =>
        c.id === currentCommit.id ? { ...c, status: 'created', metadata: { ...c.metadata, startedAt: undefined } } : c
      );
      console.log(chalk.green('✓ Intent reset to created status:'));
    } else {
      updatedCommits = commits.filter((c) => c.id !== currentCommit.id);
      console.log(chalk.green('✓ Intent deleted:'));
    }

    await storage.saveCommits(updatedCommits);

    console.log(`ID: ${chalk.blue(currentCommit.id)}`);
    console.log(`Message: ${currentCommit.message}`);
    console.log('\nNote: Your staged changes are preserved.');
  });

export default cancel;
