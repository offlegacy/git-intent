import { storage } from '@git-intent/core';
import chalk from 'chalk';
import { Command } from 'commander';
import prompts from 'prompts';

const drop = new Command()
  .command('drop')
  .description('Drop a planned intent')
  .argument('[id]', 'Intent ID')
  .option('-a, --all', 'Drop all created intents')
  .action(async (id: string | undefined, options: { all?: boolean }) => {
    const commits = await storage.loadCommits();
    const createdCommits = commits.filter((c) => c.status === 'created');

    if (options.all) {
      await storage.saveCommits([]);
      console.log(chalk.green('✓ All created intents removed'));
      return;
    }

    let selectedId = id;
    if (!selectedId) {
      if (createdCommits.length === 0) {
        console.log('No created intents found. Nothing to remove.');
        return;
      }

      const response = await prompts({
        type: 'select',
        name: 'id',
        message: 'Select an intent to remove:',
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
      console.error('Can only remove intents in created status');
      return;
    }

    const updatedCommits = commits.filter((c) => c.id !== selectedId);
    await storage.saveCommits(updatedCommits);

    console.log(chalk.green('✓ Intent removed:'));
    console.log(`ID: ${chalk.blue(targetCommit.id)}`);
    console.log(`Message: ${targetCommit.message}`);
  });

export default drop;
