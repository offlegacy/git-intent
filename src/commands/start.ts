import { getCreatedCommits, hasStagedFiles, startIntentionalCommit } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';

export const start = new Command('start')
  .description('Start working on an intentional commit')
  .argument('[id]', 'Commit ID')
  .action(async (id?: string) => {
    const spinner = ora('Starting intentional commit...').start();

    try {
      const hasChanged = await hasStagedFiles();
      if (hasChanged) {
        spinner.stop();
        console.error(chalk.red('You have uncommitted changes. Please commit or stash them first.'));
        process.exit(1);
      }

      let commitId = id;

      if (!commitId) {
        spinner.stop();

        const createdCommits = await getCreatedCommits();

        if (createdCommits.length === 0) {
          console.error(chalk.red('No created commits found. Create one first with `intent create`'));
          process.exit(1);
        }

        const { selectedId } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedId',
            message: 'Select a commit to start:',
            choices: createdCommits.map((commit) => ({
              name: `${commit.message} (${commit.id})`,
              value: commit.id,
              description: commit.description,
            })),
          },
        ]);

        commitId = selectedId;
        spinner.start();
      }

      const commit = await startIntentionalCommit(commitId);
      spinner.succeed(chalk.green('Intentional commit started successfully'));
      console.log(chalk.blue(`\nStarted working on: ${chalk.bold(commit.message)}`));
      if (commit.description) {
        console.log(chalk.gray(`Description: ${commit.description}`));
      }
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to start intentional commit'));
      console.error(error);
      process.exit(1);
    }
  });
