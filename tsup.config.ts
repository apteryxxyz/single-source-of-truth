import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/command.ts'],
  format: ['esm'],
  clean: true,
  bundle: true,
  dts: true,
});
