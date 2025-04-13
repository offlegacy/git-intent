import { createCommit, hasStagedFiles } from '@/utils/git.js';
import { storage } from '@/utils/storage.js';
import chalk from 'chalk';
import { Command } from 'commander';

const done = new Command()
  .command('done')
  .description('Complete the current intent')
  .action(async () => {
    const commits = await storage.loadCommits();
    const currentCommit = commits.find((c) => c.status === 'in_progress');

    if (!currentCommit) {
      console.error('No intent in progress');
      return;
    }

    if (!(await hasStagedFiles())) {
      console.error('No staged changes');
      return;
    }

    await createCommit(currentCommit.message);

    const updatedCommits = commits.filter((c) => c.id !== currentCommit.id);
    await storage.saveCommits(updatedCommits);

    console.log(chalk.green('✓ Completed:'));
    console.log(`ID: ${chalk.blue(currentCommit.id)}`);
    console.log(`Message: ${currentCommit.message}`);

    const nextCommits = updatedCommits.filter((c) => c.status === 'created');
    if (nextCommits.length > 0) {
      console.log('\nNext intents:');
      let index = 1;
      for (const commit of nextCommits) {
        console.log(`${index}. ${commit.message} (${commit.id})`);
        index++;
      }
      console.log('\nRun "gintent start <id>" to start working on next intent');
    }
  });

export default done;
