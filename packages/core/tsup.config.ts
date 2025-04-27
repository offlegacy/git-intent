import { createTsupConfig } from '../../tsup.config.base';

export default createTsupConfig({
  entry: ['src/index.ts'],
  dts: true,
});
