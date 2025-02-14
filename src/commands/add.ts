import { addIntentionalCommit, git, hasChangedFiles, initializeRefs } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

export const add = new Command('add')
  .description('Add a new intentional commit')
  .argument('<message>', 'Commit message')
  .action(async (message) => {
    const spinner = ora('Adding intentional commit...').start();

    try {
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        spinner.stop();
        console.error(chalk.red('Current directory is not a git repository'));
        process.exit(1);
      }

      await initializeRefs();

      const hasChanged = await hasChangedFiles();
      if (hasChanged) {
        spinner.stop();
        console.error(chalk.red('You have uncommitted changes. Please commit or stash them first.'));
        process.exit(1);
      }

      await addIntentionalCommit(message);
      spinner.succeed(chalk.green('Intentional commit added successfully'));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to add intentional commit'));
      console.error(error);
      process.exit(1);
    }
  });
