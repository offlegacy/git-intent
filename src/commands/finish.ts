import { finishIntentionalCommit, getInProgressCommit, hasStagedFiles } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

export const finish = new Command('finish')
  .description('Complete an intentional commit')
  .argument('[id]', 'Commit ID')
  .action(async (id?: string) => {
    const spinner = ora('Completing intentional commit...').start();

    try {
      const hasChanged = await hasStagedFiles();
      if (!hasChanged) {
        spinner.stop();
        console.error(chalk.red('No changes to commit. Make some changes first.'));
        process.exit(1);
      }

      let commitId = id;

      if (!commitId) {
        const inProgressCommit = await getInProgressCommit();

        if (!inProgressCommit) {
          spinner.stop();
          console.error(chalk.red('No commit in progress on current branch. Start one first with `intent start`'));
          process.exit(1);
        }

        commitId = inProgressCommit.id;
      }

      const commit = await finishIntentionalCommit(commitId);
      spinner.succeed(chalk.green('Intentional commit completed successfully'));
      console.log(chalk.blue(`\nCompleted: ${chalk.bold(commit.message)}`));
      console.log(chalk.gray(`Commit Hash: ${commit.metadata.commitHash}`));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to complete intentional commit'));
      console.error(error);
      process.exit(1);
    }
  });
