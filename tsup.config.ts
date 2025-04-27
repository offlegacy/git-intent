import { createTsupConfig } from './tsup.config.base';

export default createTsupConfig({
  entry: ['src/index.ts'],
  target: ['node16'],
  format: ['esm', 'cjs'],
});
