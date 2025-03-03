import { storage } from '@/utils/storage';
import { describe, expect, test } from 'vitest';
import { runCLI } from './test-utils';

describe('start command', () => {
  test('should start an intentional commit', async () => {
    await runCLI('create', ['Test commit']);
    await runCLI('start', {
      input: ' ',
    });

    const commits = await storage.loadCommits();
    expect(commits.length).toBe(1);
    expect(commits[0].message).toBe('Test commit');
    expect(commits[0].status).toBe('in_progress');
  });
});
