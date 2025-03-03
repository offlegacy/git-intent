import { storage } from '@/utils/storage';
import { Command } from 'commander';
import prompts from 'prompts';

const clear = new Command()
  .command('clear')
  .description('Clear all intentional commits')
  .action(async () => {
    const response = await prompts({
      type: 'confirm',
      name: 'clear',
      message: 'Are you sure you want to clear all intentional commits?',
      initial: false,
    });

    if (!response.clear) {
      return;
    }

    await storage.clearCommits();
    console.log('All intentional commits cleared');
  });

export default clear;
