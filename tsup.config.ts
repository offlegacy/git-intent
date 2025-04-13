import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  dts: true,
  minify: true,
  shims: true,
  external: ['execa'],
});
