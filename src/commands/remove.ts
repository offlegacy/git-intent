import { deleteIntentionalCommit, getIntentionalCommits, git, initializeRefs } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';

export const remove = new Command('remove').description('Remove intentional commits').action(async () => {
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

    if (commits.length === 1) {
      await removeSingleCommit(commits[0]);
      return;
    }

    await removeMultipleCommits(commits);
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Failed to remove intentional commits'));
    console.error(error);
    process.exit(1);
  }
});

async function removeSingleCommit(commit: { id: string; message: string }) {
  const answer = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to remove this commit?\n${commit.message} (${commit.id})`,
      default: false,
    },
  ]);

  if (answer.confirm) {
    const spinner = ora('Removing intentional commit...').start();
    try {
      await deleteIntentionalCommit(commit.id);
      spinner.succeed(chalk.green('Intentional commit removed successfully'));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to remove intentional commit'));
      console.error(error);
      process.exit(1);
    }
  }
}

async function removeMultipleCommits(commits: Array<{ id: string; message: string }>) {
  const answer = await inquirer.prompt<{ ids: string[] }>([
    {
      type: 'checkbox',
      name: 'ids',
      message: 'Select commits to remove:',
      choices: commits.map((commit) => ({
        name: `${commit.message} (${commit.id})`,
        value: commit.id,
      })),
    },
  ]);

  if (answer.ids.length === 0) {
    console.log(chalk.yellow('No commits selected'));
    return;
  }

  const spinner = ora('Removing intentional commits...').start();
  try {
    for (const id of answer.ids) {
      await deleteIntentionalCommit(id);
    }
    spinner.succeed(chalk.green('Intentional commits removed successfully'));
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Failed to remove intentional commits'));
    console.error(error);
    process.exit(1);
  }
}
