import { Registry } from './registry.js';

export interface Modules {
  registry: Registry;
  arktype: typeof import('./arktype/config');
  prisma: typeof import('./prisma/config');
}

export type Config = (modules: Modules) => void;
export const defineConfig = (fn: Config) => fn;

export { Registry };
