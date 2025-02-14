import { loadCommits } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

interface ListCommandOptions {
  status?: 'created' | 'in_progress' | 'completed';
  format?: 'simple' | 'detailed';
}

export const list = new Command('list')
  .description('List all intentional commits')
  .option('-s, --status <status>', 'Filter by status (created/in_progress/completed)')
  .option('-f, --format <format>', 'Output format (simple/detailed)', 'simple')
  .action(async (options: ListCommandOptions) => {
    const spinner = ora('Loading commits...').start();

    try {
      const commits = await loadCommits();

      spinner.stop();

      if (commits.length === 0) {
        console.log(chalk.gray('No intentional commits found.'));
        return;
      }

      const filteredCommits = options.status ? commits.filter((commit) => commit.status === options.status) : commits;

      if (filteredCommits.length === 0) {
        console.log(chalk.gray(`No commits with status '${options.status}' found.`));
        return;
      }

      const isDetailed = options.format === 'detailed';

      console.log(chalk.bold('\nIntentional Commits:'));
      for (const commit of filteredCommits) {
        const statusColor = (
          {
            created: 'blue',
            in_progress: 'yellow',
            completed: 'green',
          } as const
        )[commit.status];

        console.log(chalk[statusColor](`\n${commit.message} (${commit.id})`));
        console.log(chalk.gray(`Status: ${commit.status}`));

        if (isDetailed) {
          console.log(chalk.gray(`Created: ${new Date(commit.metadata.createdAt).toLocaleString()}`));

          if (commit.metadata.startedAt) {
            console.log(chalk.gray(`Started: ${new Date(commit.metadata.startedAt).toLocaleString()}`));
          }

          if (commit.metadata.completedAt) {
            console.log(chalk.gray(`Completed: ${new Date(commit.metadata.completedAt).toLocaleString()}`));
          }

          if (commit.metadata.branch) {
            console.log(chalk.gray(`Branch: ${commit.metadata.branch}`));
          }

          if (commit.metadata.commitHash) {
            console.log(chalk.gray(`Commit: ${commit.metadata.commitHash}`));
          }
        }
      }
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to list intentional commits'));
      console.error(error);
      process.exit(1);
    }
  });
