import { createIntentionalCommit, git, initializeRefs } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import { edit } from 'external-editor';
import ora from 'ora';

export const create = new Command('create')
  .description('Create a new intentional commit')
  .argument('[message]', 'Commit message')
  .action(async (message?: string) => {
    const spinner = ora('Creating intentional commit...').start();

    try {
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        spinner.stop();
        console.error(chalk.red('Current directory is not a git repository'));
        process.exit(1);
      }

      await initializeRefs();

      let commitMessage = message;

      if (!commitMessage) {
        spinner.stop();
        try {
          commitMessage = edit('').trim();

          if (!commitMessage) {
            console.error(chalk.red('Aborting due to empty commit message'));
            process.exit(1);
          }
        } catch (err) {
          console.error(chalk.red('Failed to open editor'));
          process.exit(1);
        }
        spinner.start();
      }

      const commit = await createIntentionalCommit(commitMessage);
      spinner.succeed(chalk.green('Intentional commit created successfully'));
      console.log(chalk.blue(`\nCreated commit with ID: ${chalk.bold(commit.id)}`));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to create intentional commit'));
      console.error(error);
      process.exit(1);
    }
  });
