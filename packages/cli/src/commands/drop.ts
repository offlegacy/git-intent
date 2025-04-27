import type { IntentionalCommit } from '@git-intent/core';
import { storage } from '@git-intent/core';
import chalk from 'chalk';
import { Command } from 'commander';
import prompts from 'prompts';

const drop = new Command()
  .command('drop')
  .description('Drop an intention')
  .argument('[id]', 'Intent ID')
  .action(async (id?: string) => {
    const commits = await storage.loadCommits();

    if (commits.length === 0) {
      console.log('No intentions found');
      return;
    }

    let targetCommit: IntentionalCommit | undefined;

    if (id) {
      targetCommit = commits.find((c) => c.id === id);
      if (!targetCommit) {
        console.log(`Intent with ID ${id} not found`);
        return;
      }
    } else {
      const { commitId } = await prompts({
        type: 'select',
        name: 'commitId',
        message: 'Select an intention to drop:',
        choices: commits.map((c) => ({
          title: `${c.id} - ${c.status === 'in_progress' ? '[IN PROGRESS] ' : ''}${c.message}`,
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

    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to drop the intention: "${targetCommit.message}"?`,
      initial: false,
    });

    if (!confirm) {
      console.log('Operation cancelled');
      return;
    }

    const updatedCommits = commits.filter((c) => c.id !== targetCommit!.id);
    await storage.saveCommits(updatedCommits);

    console.log(chalk.green('✓ Intent dropped:'));
    console.log(`ID: ${chalk.blue(targetCommit.id)}`);
    console.log(`Message: ${targetCommit.message}`);
  });

export default drop;
