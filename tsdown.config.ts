import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/command.ts', 'src/config.ts', 'src/*/index.ts'],
  dts: true,
});
