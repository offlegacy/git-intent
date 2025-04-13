import { storage } from '@/utils/storage.js';
import chalk from 'chalk';
import { Command } from 'commander';
import edit from 'external-editor';
import prompts from 'prompts';

const split = new Command()
  .command('split')
  .description('Split an intentional commit into smaller parts')
  .action(async () => {
    const commits = await storage.loadCommits();

    if (commits.length === 0) {
      console.log('No intents found to split');
      return;
    }

    const response = await prompts({
      type: 'select',
      name: 'id',
      message: 'Select an intent to split:',
      choices: commits.map((c) => ({
        title: `[${c.status === 'created' ? 'Created' : 'In Progress'}] ${c.message.split('\n')[0]} (${c.id})`,
        value: c.id,
      })),
      onState: (state) => {
        if (state.aborted) {
          process.nextTick(() => {
            process.exit(0);
          });
        }
      },
    });

    const selectedId = response.id;
    if (!selectedId) {
      console.log('No intent selected');
      return;
    }

    const targetCommit = commits.find((c) => c.id === selectedId);
    if (!targetCommit) {
      console.error('Intent not found');
      return;
    }

    console.log(chalk.blue('\nOriginal commit:'), targetCommit.message);

    const tasks: string[] = [];

    console.log(chalk.yellow('\nSplitting commit into two tasks.'));
    console.log(
      chalk.dim(
        'Tip: Enter a title directly for a simple task, or leave it empty to open an editor for a detailed commit message.'
      )
    );

    console.log(chalk.blue('\nFirst task:'));
    const { taskTitle: firstTaskTitle } = await prompts({
      type: 'text',
      name: 'taskTitle',
      message: 'Task 1 title:',
      onState: (state) => {
        if (state.aborted) {
          process.nextTick(() => {
            process.exit(0);
          });
        }
      },
    });

    if (firstTaskTitle && firstTaskTitle.trim() !== '') {
      tasks.push(firstTaskTitle.trim());
    } else {
      console.log(chalk.dim('Opening editor for commit message. Save and close the editor when done.'));

      let initialText = targetCommit.message;

      initialText = `# Enter commit message for the first task\n# Lines starting with # will be ignored\n\n${initialText}`;

      const message = edit.edit(initialText, {
        postfix: '.git-intent-split',
      });

      const fullMessage = message
        .split('\n')
        .filter((line) => !line.trim().startsWith('#'))
        .join('\n')
        .trim();

      if (!fullMessage) {
        console.log('No message provided for the first task. Operation cancelled.');
        return;
      }

      tasks.push(fullMessage);
    }

    console.log(chalk.blue('\nSecond task:'));
    const { taskTitle: secondTaskTitle } = await prompts({
      type: 'text',
      name: 'taskTitle',
      message: 'Task 2 title:',
      onState: (state) => {
        if (state.aborted) {
          process.nextTick(() => {
            process.exit(0);
          });
        }
      },
    });

    if (secondTaskTitle && secondTaskTitle.trim() !== '') {
      tasks.push(secondTaskTitle.trim());
    } else {
      console.log(chalk.dim('Opening editor for commit message. Save and close the editor when done.'));

      const initialText = '# Enter commit message for the second task\n# Lines starting with # will be ignored\n';

      const message = edit.edit(initialText, {
        postfix: '.git-intent-split',
      });

      const fullMessage = message
        .split('\n')
        .filter((line) => !line.trim().startsWith('#'))
        .join('\n')
        .trim();

      if (!fullMessage) {
        console.log('No message provided for the second task. Operation cancelled.');
        return;
      }

      tasks.push(fullMessage);
    }

    console.log(chalk.blue('\nTasks to create:'));
    tasks.forEach((task, index) => {
      const title = task.split('\n')[0];
      console.log(`${index + 1}. ${title}`);

      if (task.includes('\n')) {
        const preview = task.split('\n').slice(1).join(' ').trim();
        const shortPreview = preview.length > 60 ? `${preview.substring(0, 57)}...` : preview;
        if (shortPreview) {
          console.log(`   ${chalk.dim(shortPreview)}`);
        }
      }
    });

    const { confirmed } = await prompts({
      type: 'confirm',
      name: 'confirmed',
      message: 'Do you want to split the commit with these tasks?',
      initial: true,
      onState: (state) => {
        if (state.aborted) {
          process.nextTick(() => {
            process.exit(0);
          });
        }
      },
    });

    if (!confirmed) {
      console.log('Operation cancelled.');
      return;
    }

    const { shouldRemoveOriginal } = await prompts({
      type: 'confirm',
      name: 'shouldRemoveOriginal',
      message: 'Do you want to remove the original commit?',
      initial: false,
      onState: (state) => {
        if (state.aborted) {
          process.nextTick(() => {
            process.exit(0);
          });
        }
      },
    });

    const newCommitIds: string[] = [];
    for (const task of tasks) {
      const newCommitId = await storage.addCommit({
        message: task,
        status: 'created',
        metadata: {
          createdAt: new Date().toISOString(),
        },
      });
      newCommitIds.push(newCommitId);
    }

    if (shouldRemoveOriginal) {
      await storage.deleteCommit(targetCommit.id);
    }

    console.log(chalk.green('✓ Successfully split the commit:'));
    for (let i = 0; i < tasks.length; i++) {
      const title = tasks[i].split('\n')[0];
      console.log(`${i + 1}. ${chalk.blue(title)} (ID: ${newCommitIds[i]})`);
    }

    if (!shouldRemoveOriginal) {
      console.log(chalk.yellow('\nOriginal commit was kept:'));
      const originalTitle = targetCommit.message.split('\n')[0];
      console.log(`${chalk.blue(originalTitle)} (ID: ${targetCommit.id})`);
    }
  });

export default split;
