import chalk from 'chalk';
import Table from 'cli-table3';
import { Command } from 'commander';
import simpleGit from 'simple-git';
import { type Task, TaskSchema } from '../types';

const git = simpleGit();

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'TODO':
      return chalk.yellow;
    case 'IN-PROGRESS':
      return chalk.blue;
    case 'DONE':
      return chalk.green;
  }
};

export const list = new Command()
  .name('list')
  .description('List all tasks')
  .option('-s, --status <status>', 'Filter by status (TODO/IN-PROGRESS/DONE)')
  .action(async (options) => {
    try {
      const configs = await git.listConfig();
      const tasks: Task[] = [];

      for (const [key, value] of Object.entries(configs.all)) {
        if (key.startsWith('todo.')) {
          const task = TaskSchema.parse(JSON.parse(value as string));
          tasks.push(task);
        }
      }

      const filteredTasks = options.status
        ? tasks.filter((task) => task.status === options.status.toUpperCase())
        : tasks;

      if (filteredTasks.length === 0) {
        console.log(chalk.yellow('No tasks found'));
        return;
      }

      filteredTasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const table = new Table({
        head: [
          chalk.white.bold('ID'),
          chalk.white.bold('Status'),
          chalk.white.bold('Title'),
          chalk.white.bold('Created At'),
        ],
        style: {
          head: [],
          border: [],
        },
      });

      for (const task of filteredTasks) {
        const statusColor = getStatusColor(task.status);
        const date = new Date(task.createdAt).toLocaleString();

        table.push([chalk.cyan(task.id), statusColor(task.status), task.title, chalk.gray(date)]);
      }

      console.log(table.toString());
      console.log(chalk.dim(`\nTotal: ${filteredTasks.length} tasks`));
    } catch (error) {
      console.error(chalk.red('Failed to list tasks:'), error);
      process.exit(1);
    }
  });
