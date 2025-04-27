import { git, storage } from '@git-intent/core';
import chalk from 'chalk';
import { Command } from 'commander';
import prompts from 'prompts';

const divide = new Command()
  .command('divide')
  .description('Divide current intention into multiple intentions')
  .action(async () => {
    const commits = await storage.loadCommits();
    const currentCommit = commits.find((c) => c.status === 'in_progress');

    if (!currentCommit) {
      console.log('No active intention');
      return;
    }

    const status = await git.getStatus();
    if (status.staged.length === 0) {
      console.log('No staged changes to divide');
      return;
    }

    console.log(chalk.blue('Current staged files:'));
    for (const file of status.staged) {
      console.log(`  ${file}`);
    }

    console.log('\nYou can divide these staged changes into multiple intentions.');
    console.log('This will create new intentions for each group of files you select.');
    console.log('The current intention will be updated with the remaining files.\n');

    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to divide the current intention?',
      initial: true,
    });

    if (!confirm) {
      return;
    }

    const stagedFiles = status.staged;
    const newIntentions: Array<{ message: string; files: string[] }> = [];
    let remainingFiles = [...stagedFiles];

    while (remainingFiles.length > 0) {
      const { files } = await prompts({
        type: 'multiselect',
        name: 'files',
        message: 'Select files for a new intention (or none to finish):',
        choices: remainingFiles.map((file) => ({ title: file, value: file })),
        hint: 'Space to select, Enter to confirm',
      });

      if (!files || files.length === 0) {
        break;
      }

      const { message } = await prompts({
        type: 'text',
        name: 'message',
        message: 'Enter a message for this new intention:',
        validate: (value) => (value.trim() ? true : 'Message is required'),
      });

      if (!message) {
        console.log('Cancelled.');
        return;
      }

      newIntentions.push({ message, files });
      remainingFiles = remainingFiles.filter((file) => !files.includes(file));
    }

    if (newIntentions.length === 0) {
      console.log('No new intentions created. Operation cancelled.');
      return;
    }

    // Unstage all files
    await git.raw(['reset', 'HEAD']);

    // Create new intentions
    for (const intention of newIntentions) {
      // Stage the files for this intention
      for (const file of intention.files) {
        await git.raw(['add', file]);
      }

      // Create a new intention
      const newCommitId = await storage.addCommit({
        message: intention.message,
        status: 'created',
        metadata: {
          createdAt: new Date().toISOString(),
        },
      });

      console.log(chalk.green(`✓ New intention created: ${newCommitId}`));
      console.log(`Message: ${intention.message}`);
      console.log(`Files: ${intention.files.join(', ')}`);
      console.log('');

      // Unstage the files
      await git.raw(['reset', 'HEAD']);
    }

    // Stage the remaining files for the original intention
    if (remainingFiles.length > 0) {
      for (const file of remainingFiles) {
        await git.raw(['add', file]);
      }

      console.log(chalk.green('✓ Original intention updated:'));
      console.log(`ID: ${chalk.blue(currentCommit.id)}`);
      console.log(`Message: ${currentCommit.message}`);
      console.log(`Remaining files: ${remainingFiles.join(', ')}`);
    } else {
      // If no files remain, ask what to do with the original intention
      const { action } = await prompts({
        type: 'select',
        name: 'action',
        message: 'What would you like to do with the original intention?',
        choices: [
          { title: 'Keep it (empty)', value: 'keep' },
          { title: 'Delete it', value: 'delete' },
        ],
      });

      if (action === 'delete') {
        const updatedCommits = commits.filter((c) => c.id !== currentCommit.id);
        await storage.saveCommits(updatedCommits);
        console.log(chalk.green('✓ Original intention deleted'));
      } else {
        console.log(chalk.green('✓ Original intention kept (no files)'));
      }
    }

    console.log('\nDivision complete. Use `git-intent start` to start working on any of the new intentions.');
  });

export default divide;
