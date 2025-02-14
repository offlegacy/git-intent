import { getIntentionalCommits, git, initializeRefs } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

export const list = new Command('list').description('List all intentional commits').action(async () => {
  const spinner = ora('Fetching intentional commits...').start();

  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      spinner.stop();
      console.error(chalk.red('Current directory is not a git repository'));
      process.exit(1);
    }

    await initializeRefs();
    const commits = await getIntentionalCommits();
    spinner.stop();

    if (commits.length === 0) {
      console.log(chalk.yellow('No intentional commits found'));
      return;
    }

    console.log(chalk.bold('\nIntentional Commits:'));
    for (const commit of commits) {
      console.log(
        `\n${chalk.blue('ID:')} ${commit.id}
${chalk.blue('Message:')} ${commit.message}
${chalk.blue('Created:')} ${new Date(commit.createdAt).toLocaleString()}${
          commit.completedAt ? `\n${chalk.blue('Completed:')} ${new Date(commit.completedAt).toLocaleString()}` : ''
        }`
      );
    }
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Failed to fetch intentional commits'));
    console.error(error);
    process.exit(1);
  }
});
