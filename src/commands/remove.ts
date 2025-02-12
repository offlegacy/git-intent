import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import simpleGit from 'simple-git';
import { TaskSchema } from '../types';

const git = simpleGit();

export const remove = new Command()
  .name('remove')
  .description('Remove a task')
  .argument('<taskId>', 'Task ID to remove')
  .action(async (taskId: string) => {
    const spinner = ora('Loading task...').start();

    try {
      const taskJson = await git.getConfig(`todo.${taskId}`);
      if (!taskJson.value) {
        spinner.fail(chalk.red('Task not found'));
        process.exit(1);
      }

      const task = TaskSchema.parse(JSON.parse(taskJson.value));

      spinner.text = 'Removing task...';
      await git.raw(['config', '--local', '--unset', `todo.${taskId}`]);

      spinner.succeed(chalk.green('Task removed successfully'));
      console.log(`\n${chalk.cyan('Title:')} ${task.title}`);
    } catch (error) {
      spinner.fail(chalk.red('Failed to remove task:'));
      console.error(error);
      process.exit(1);
    }
  });
