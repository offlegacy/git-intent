import { loadCommits, saveCommits } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';

export const remove = new Command('remove')
  .description('Remove an intentional commit')
  .argument('<id>', 'Commit ID')
  .option('-f, --force', 'Force remove in-progress commit')
  .action(async (id: string, options: { force?: boolean }) => {
    const spinner = ora('Removing intentional commit...').start();

    try {
      const commits = await loadCommits();
      const commitIndex = commits.findIndex((c) => c.id === id);

      if (commitIndex === -1) {
        spinner.stop();
        console.error(chalk.red('Commit not found'));
        process.exit(1);
      }

      const commit = commits[commitIndex];

      if (commit.status === 'completed') {
        spinner.stop();
        console.error(chalk.red('Cannot remove completed commit'));
        process.exit(1);
      }

      if (commit.status === 'in_progress' && !options.force) {
        spinner.stop();
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellow('This commit is in progress. Are you sure you want to remove it?'),
            default: false,
          },
        ]);

        if (!confirm) {
          console.log(chalk.gray('Removal cancelled'));
          process.exit(0);
        }

        spinner.start();
      }

      commits.splice(commitIndex, 1);
      await saveCommits(commits);

      spinner.succeed(chalk.green('Intentional commit removed successfully'));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to remove intentional commit'));
      console.error(error);
      process.exit(1);
    }
  });
