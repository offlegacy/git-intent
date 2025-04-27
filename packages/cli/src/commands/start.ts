import { git, storage } from '@offlegacy/git-intent-core';
import chalk from 'chalk';
import { Command } from 'commander';
import prompts from 'prompts';

const start = new Command()
  .command('start')
  .argument('[id]', 'Intent ID')
  .description('Start working on a planned intent')
  .action(async (id?: string) => {
    const commits = await storage.loadCommits();

    let selectedId = id;
    if (!selectedId) {
      const createdCommits = commits.filter((c) => c.status === 'created');
      if (createdCommits.length === 0) {
        console.log('No created intents found');
        return;
      }

      const response = await prompts({
        type: 'select',
        name: 'id',
        message: 'Select an intent to start:',
        choices: createdCommits.map((c) => ({
          title: `${c.message} (${c.id})`,
          value: c.id,
        })),
      });

      selectedId = response.id;
    }

    if (!selectedId) {
      console.error('No intent selected');
      return;
    }

    const targetCommit = commits.find((c) => c.id === selectedId);

    if (!targetCommit) {
      console.error('Intent not found');
      return;
    }

    if (targetCommit.status !== 'created') {
      console.error('Intent is not in created status');
      return;
    }

    const currentBranch = await git.getCurrentBranch();
    targetCommit.status = 'in_progress';
    targetCommit.metadata.startedAt = new Date().toISOString();
    targetCommit.metadata.branch = currentBranch;

    await storage.saveCommits(commits);

    console.log(chalk.green('✓ Started working on:'));
    console.log(`ID: ${chalk.blue(targetCommit.id)}`);
    console.log(`Message: ${targetCommit.message}`);
  });

export default start;
