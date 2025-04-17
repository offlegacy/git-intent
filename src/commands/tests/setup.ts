import { afterAll, beforeAll } from 'vitest';
import { testEnvironment } from './test-environment.js';

beforeAll(async () => {
  await testEnvironment.setup();
});

afterAll(async () => {
  await testEnvironment.cleanup();
});
