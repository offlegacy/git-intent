import { getCurrentBranch, getIntentionalCommits, git, initializeRefs } from '@/lib/git';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';

export const edit = new Command('edit')
  .description('Edit an intentional commit')
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
      const commits = await getIntentionalCommits();
      spinner.stop();

      if (commits.length === 0) {
        console.log(chalk.yellow('No intentional commits found'));
        return;
      }

      if (!id) {
        if (commits.length === 1) {
          const selectedId = commits[0].id;
          await editCommit(selectedId);
          return;
        }

        const answer = await inquirer.prompt<{ id: string }>([
          {
            type: 'list',
            name: 'id',
            message: 'Select a commit to edit:',
            choices: commits.map((commit) => ({
              name: `${commit.message} (${commit.id})`,
              value: commit.id,
            })),
          },
        ]);
        await editCommit(answer.id);
        return;
      }

      await editCommit(id);
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to edit intentional commit'));
      console.error(error);
      process.exit(1);
    }
  });

async function editCommit(id: string) {
  const spinner = ora('Fetching intentional commit...').start();
  try {
    const commits = await getIntentionalCommits();
    const commit = commits.find((c) => c.id === id);
    if (!commit) {
      console.error(chalk.red('Intentional commit not found'));
      process.exit(1);
    }

    spinner.stop();
    const answer = await inquirer.prompt<{ message: string }>([
      {
        type: 'input',
        name: 'message',
        message: 'Edit commit message:',
        default: commit.message,
      },
    ]);

    spinner.start('Updating intentional commit...');
    commit.message = answer.message;
    await git.raw(['update-ref', `refs/local/git-todo/commits/${await getCurrentBranch()}`, commit.id]);
    spinner.succeed(chalk.green('Intentional commit updated successfully'));
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Failed to edit intentional commit'));
    console.error(error);
    process.exit(1);
  }
}
