import chalk from 'chalk';
import { Command } from 'commander';
import { nanoid } from 'nanoid';
import ora from 'ora';
import simpleGit from 'simple-git';
import { TaskSchema } from '../types';

const git = simpleGit();

export const add = new Command()
  .name('add')
  .description('Add a new task')
  .argument('<title>', 'Task title')
  .action(async (title: string) => {
    const spinner = ora('Checking git repository...').start();

    try {
      const isGitRepo = await git.checkIsRepo();
      if (!isGitRepo) {
        spinner.fail(chalk.red('Current directory is not a git repository'));
        process.exit(1);
      }

      spinner.text = 'Creating new task...';
      const taskId = nanoid(8);
      const task = TaskSchema.parse({
        id: taskId,
        title,
        status: 'TODO' as const,
        createdAt: new Date().toISOString(),
      });

      await git.addConfig(`todo.${taskId}`, JSON.stringify(task), false, 'local');

      spinner.succeed(chalk.green('Task created successfully'));
      console.log(`\n${chalk.cyan('Title:')} ${title}`);
      console.log(`${chalk.cyan('ID:')} ${taskId}`);
    } catch (error) {
      spinner.fail(chalk.red('Failed to add task:'));
      console.error(error);
      process.exit(1);
    }
  });
