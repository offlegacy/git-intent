import { storage } from '@/utils/storage.js';
import { Command } from 'commander';
import prompts from 'prompts';

const reset = new Command()
  .command('reset')
  .description('Reset all intents')
  .action(async () => {
    const response = await prompts({
      type: 'confirm',
      name: 'reset',
      message: 'Are you sure you want to reset all intents?',
      initial: false,
    });

    if (!response.reset) {
      return;
    }

    await storage.clearCommits();
    console.log('All intents reset');
  });

export default reset;
