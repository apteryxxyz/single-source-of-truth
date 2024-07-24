import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts', 'src/zod.ts'],
  format: ['esm'],
  bundle: true,
  dts: true,
});
