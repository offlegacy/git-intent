import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import simpleGit from 'simple-git';
import { TaskSchema } from '../types';

const git = simpleGit();

export const done = new Command()
  .name('done')
  .description('Mark a task as done')
  .argument('<taskId>', 'Task ID to complete')
  .option('-m, --message <message>', 'Commit message')
  .action(async (taskId: string, options) => {
    const spinner = ora('Loading task...').start();

    try {
      const taskJson = await git.getConfig(`todo.${taskId}`);
      if (!taskJson.value) {
        spinner.fail(chalk.red('Task not found'));
        process.exit(1);
      }

      const task = TaskSchema.parse(JSON.parse(taskJson.value));

      if (task.status === 'DONE') {
        spinner.info(chalk.yellow('Task is already completed'));
        return;
      }

      spinner.text = 'Staging changes...';
      await git.add('.');

      spinner.text = 'Creating commit...';
      const commitMessage = options.message || task.title;
      await git.commit(commitMessage);

      spinner.text = 'Updating task status...';
      task.status = 'DONE';
      await git.addConfig(`todo.${taskId}`, JSON.stringify(task), false, 'local');

      spinner.succeed(chalk.green('Task completed successfully'));
      console.log(`\n${chalk.cyan('Title:')} ${task.title}`);
      console.log(`${chalk.cyan('Commit:')} ${commitMessage}`);
    } catch (error) {
      spinner.fail(chalk.red('Failed to complete task:'));
      console.error(error);
      process.exit(1);
    }
  });
