import { getCreatedCommits, getCurrentBranch, getInProgressCommit, git } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

export const status = new Command('status')
  .description('Show current branch status and intentions')
  .action(async () => {
    const spinner = ora('Loading status...').start();

    try {
      const currentBranch = await getCurrentBranch();
      const status = await git.status();

      const inProgressCommit = await getInProgressCommit(currentBranch);
      const createdCommits = await getCreatedCommits();

      spinner.stop();

      console.log(chalk.bold(`\nOn branch ${chalk.green(currentBranch)}`));

      // Display changes
      if (status.files.length > 0) {
        console.log(chalk.bold('\nChanges:'));
        for (const file of status.files) {
          const color = file.working_dir === 'M' ? 'blue' : 'red';
          console.log(chalk[color](`  ${file.path}`));
        }
      }

      if (inProgressCommit?.status) {
        console.log(chalk.bold('\nIn Progress:'));
        console.log(chalk.yellow(`  ${inProgressCommit.message} (${inProgressCommit.id})`));

        if (inProgressCommit.metadata.startedAt) {
          console.log(chalk.gray(`  Started: ${new Date(inProgressCommit.metadata.startedAt).toLocaleString()}`));
        }
      }

      if (createdCommits.length > 0) {
        console.log(chalk.bold('\nPending Intentions:'));
        for (const commit of createdCommits) {
          console.log(chalk.blue(`  ${commit.message} (${commit.id})`));
        }
      }

      if (!inProgressCommit && createdCommits.length === 0) {
        console.log(chalk.gray('\nNo intentions in progress or pending.'));
      }
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to get status'));
      console.error(error);
      process.exit(1);
    }
  });
