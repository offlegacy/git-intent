import { type Options, defineConfig } from 'tsup';

export function createTsupConfig(options: Partial<Options> = {}) {
  return defineConfig({
    format: ['esm', 'cjs'],
    clean: true,
    dts: true,
    ...options,
  });
}

export default createTsupConfig();
