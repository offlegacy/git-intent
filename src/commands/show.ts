import { getUncompletedIntentionalCommits, git, initializeRefs } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';

export const show = new Command('show')
  .description('Show an intentional commit')
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
          await showCommit(selectedId);
          return;
        }

        const answer = await inquirer.prompt<{ id: string }>([
          {
            type: 'list',
            name: 'id',
            message: 'Select a commit to show:',
            choices: commits.map((commit) => ({
              name: `${commit.message} (${commit.id})`,
              value: commit.id,
            })),
          },
        ]);
        await showCommit(answer.id);
        return;
      }

      await showCommit(id);
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to fetch intentional commit'));
      console.error(error);
      process.exit(1);
    }
  });

async function showCommit(id: string) {
  const spinner = ora('Fetching intentional commit...').start();
  try {
    const commits = await getUncompletedIntentionalCommits();
    const commit = commits.find((c) => c.id === id);
    if (!commit) {
      console.error(chalk.red('Intentional commit not found'));
      process.exit(1);
    }

    spinner.stop();
    console.log(
      `\n${chalk.blue('ID:')} ${commit.id}
${chalk.blue('Message:')} ${commit.message}
${chalk.blue('Created:')} ${new Date(commit.createdAt).toLocaleString()}${
        commit.completedAt ? `\n${chalk.blue('Completed:')} ${new Date(commit.completedAt).toLocaleString()}` : ''
      }`
    );
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Failed to fetch intentional commit'));
    console.error(error);
    process.exit(1);
  }
}
