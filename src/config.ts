import { Registry } from './registry.js';

export interface Modules {
  registry: Registry;
  zod: typeof import('./zod/config.js');
  prisma: typeof import('./prisma/config.js');
}

export type ConfigFn = (modules: Modules) => void;
export const defineConfig = (fn: ConfigFn) => fn;

export { Registry };
