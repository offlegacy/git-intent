import {
  completeIntentionalCommit,
  getIntentionalCommits,
  getUncompletedIntentionalCommits,
  git,
  hasStagedFiles,
  initializeRefs,
} from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';

export const finish = new Command('finish')
  .description('Complete an intentional commit')
  .argument('[id]', 'Commit ID')
  .action(async (id) => {
    const spinner = ora('Fetching intentional commit...').start();

    try {
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        spinner.stop();
        console.error(chalk.red('Current directory is not a git repository'));
        process.exit(1);
      }

      await initializeRefs();
      const commits = await getUncompletedIntentionalCommits();
      spinner.stop();

      if (commits.length === 0) {
        console.log(chalk.yellow('No intentional commits found'));
        return;
      }

      if (!id) {
        if (commits.length === 1) {
          const selectedId = commits[0].id;
          await completeCommit(selectedId);
          return;
        }

        const answer = await inquirer.prompt<{ id: string }>([
          {
            type: 'list',
            name: 'id',
            message: 'Select a commit to complete:',
            choices: commits.map((commit) => ({
              name: `${commit.message} (${commit.id})`,
              value: commit.id,
            })),
          },
        ]);
        await completeCommit(answer.id);
        return;
      }

      await completeCommit(id);
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to complete intentional commit'));
      console.error(error);
      process.exit(1);
    }
  });

async function completeCommit(id: string) {
  const spinner = ora('Completing intentional commit...').start();
  try {
    const hasStaged = await hasStagedFiles();
    if (!hasStaged) {
      spinner.stop();
      console.error(chalk.red('No staged changes. Please stage your changes first.'));
      process.exit(1);
    }

    const commits = await getIntentionalCommits();
    const commit = commits.find((c) => c.id === id);
    if (!commit) {
      console.error(chalk.red('Intentional commit not found'));
      process.exit(1);
    }

    await git.commit(commit.message);

    await completeIntentionalCommit(id);
    spinner.succeed(chalk.green('Intentional commit completed successfully'));
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Failed to complete intentional commit'));
    console.error(error);
    process.exit(1);
  }
}
