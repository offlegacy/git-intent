import { createCommit, hasStagedFiles } from '@/utils/git.js';
import { loadCommits, saveCommits } from '@/utils/storage.js';
import chalk from 'chalk';
import { Command } from 'commander';

const finish = new Command()
  .command('finish')
  .description('Finish current intentional commit')
  .action(async () => {
    const commits = await loadCommits();
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
    await saveCommits(updatedCommits);

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

export default finish;
