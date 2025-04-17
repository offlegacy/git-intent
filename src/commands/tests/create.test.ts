import { storage } from '@/utils/storage.js';
import { describe, expect, test } from 'vitest';
import { runCLI } from './test-utils.js';

describe('create command', () => {
  test('should create a new intentional commit', async () => {
    await runCLI('create', ['Test commit']);

    const commits = await storage.loadCommits();
    expect(commits.length).toBe(1);
    expect(commits[0].message).toBe('Test commit');
  });
});
