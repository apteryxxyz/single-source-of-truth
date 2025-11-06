import { pathToFileURL } from 'node:url';
import logger from '~/logger.js';
import type { Registry } from '~/registry.js';
import { enum_ } from './schemas/enum.js';
import { model } from './schemas/model.js';

async function import_(
  registry: Registry,
  paths: `${string}.ts` | `${string}.ts`[],
) {
  for (const path of [paths].flat()) {
    const url = pathToFileURL(path).toString();
    logger.info(`Importing schemas from '${path}'...`);
    const module = await import(url);

    for (const [name, target] of Object.entries(module)) {
      if (enum_.is(target)) {
        target.truth.name = name;
        registry.enums.set(name, target);
      }

      if (model.is(target)) {
        if (target.truth.includes.length > 0) continue;
        target.truth.name = name;
        registry.models.set(name, target);
      }
    }
  }
}
export { import_ as import };
