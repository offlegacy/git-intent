import type { IntentionalCommit } from '@git-intent/core';
import { git, storage } from '@git-intent/core';
import chalk from 'chalk';
import { Command } from 'commander';
import prompts from 'prompts';

const start = new Command()
  .command('start')
  .description('Start working on an intention')
  .argument('[id]', 'Intent ID')
  .action(async (id?: string) => {
    const commits = await storage.loadCommits();
    const createdCommits = commits.filter((c) => c.status === 'created');
    const currentCommit = commits.find((c) => c.status === 'in_progress');

    if (currentCommit) {
      console.log(chalk.yellow('You already have an active intention:'));
      console.log(`ID: ${chalk.blue(currentCommit.id)}`);
      console.log(`Message: ${currentCommit.message}`);
      console.log('\nComplete or cancel it before starting a new one.');
      return;
    }

    if (createdCommits.length === 0) {
      console.log('No intentions available to start');
      console.log('Create one first with `git-intent add`');
      return;
    }

    let targetCommit: IntentionalCommit | undefined;

    if (id) {
      targetCommit = commits.find((c) => c.id === id && c.status === 'created');
      if (!targetCommit) {
        console.log(`Intent with ID ${id} not found or already in progress`);
        return;
      }
    } else {
      const { commitId } = await prompts({
        type: 'select',
        name: 'commitId',
        message: 'Select an intention to start:',
        choices: createdCommits.map((c) => ({
          title: `${c.id} - ${c.message}`,
          value: c.id,
        })),
      });

      if (!commitId) {
        return;
      }

      targetCommit = commits.find((c) => c.id === commitId);
    }

    if (!targetCommit) {
      return;
    }

    // Get current branch name outside of the map function
    const currentBranch = await git.getCurrentBranch();

    const updatedCommits: IntentionalCommit[] = commits.map((c) =>
      c.id === targetCommit.id
        ? {
            ...c,
            status: 'in_progress',
            metadata: {
              ...c.metadata,
              startedAt: new Date().toISOString(),
              branch: currentBranch,
            },
          }
        : c
    );

    await storage.saveCommits(updatedCommits);

    console.log(chalk.green('✓ Intent started:'));
    console.log(`ID: ${chalk.blue(targetCommit.id)}`);
    console.log(`Message: ${targetCommit.message}`);
  });

export default start;
