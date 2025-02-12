import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import simpleGit from 'simple-git';
import { TaskSchema } from '../types';

const git = simpleGit();

export const start = new Command()
  .name('start')
  .description('Start working on a task')
  .argument('<taskId>', 'Task ID to start')
  .action(async (taskId: string) => {
    const spinner = ora('Loading task...').start();

    try {
      const taskJson = await git.getConfig(`todo.${taskId}`);
      if (!taskJson.value) {
        spinner.fail(chalk.red('Task not found'));
        process.exit(1);
      }

      const task = TaskSchema.parse(JSON.parse(taskJson.value));

      if (task.status === 'IN-PROGRESS') {
        spinner.info(chalk.yellow('Task is already in progress'));
        return;
      }

      if (task.status === 'DONE') {
        spinner.info(chalk.yellow('Task is already completed'));
        return;
      }

      spinner.text = 'Updating task status...';
      task.status = 'IN-PROGRESS';
      await git.addConfig(`todo.${taskId}`, JSON.stringify(task), false, 'local');

      spinner.succeed(chalk.green('Task started successfully'));
      console.log(`\n${chalk.cyan('Title:')} ${task.title}`);
    } catch (error) {
      spinner.fail(chalk.red('Failed to start task:'));
      console.error(error);
      process.exit(1);
    }
  });
