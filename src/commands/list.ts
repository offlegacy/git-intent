import { loadCommits } from '@/utils/storage.js';
import chalk from 'chalk';
import { Command } from 'commander';

const list = new Command()
  .command('list')
  .description('List all intentional commits')
  .action(async () => {
    const commits = await loadCommits();

    if (commits.length === 0) {
      console.log('No intents found');
      return;
    }

    console.log('\nCreated:');
    const createdCommits = commits.filter((commit) => commit.status === 'created');
    for (const commit of createdCommits) {
      console.log(chalk.white(`  [${commit.id}] ${commit.message}`));
    }

    console.log('\nIn Progress:');
    const inProgressCommits = commits.filter((commit) => commit.status === 'in_progress');
    for (const commit of inProgressCommits) {
      console.log(chalk.blue(`  [${commit.id}] ${commit.message}`));
    }
  });

export default list;
