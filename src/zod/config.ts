import { pathToFileURL } from 'node:url';
import logger from '~/logger.js';
import type { Registry } from '~/registry.js';
import type { MaybeArray, Path } from '~/types.js';
import { TruthEnum } from './schemas/enum.js';
import { TruthModel } from './schemas/model.js';

async function import_(
  registry: Registry,
  possiblePaths: MaybeArray<Path<'.ts'>>,
) {
  for (const relativePath of Array.isArray(possiblePaths)
    ? possiblePaths
    : [possiblePaths]) {
    const url = pathToFileURL(relativePath).toString();

    logger.info(`Importing schemas from '${relativePath}'...`);
    const module = await import(url);

    for (const [name, target] of Object.entries(module)) {
      if (target instanceof TruthEnum) {
        target.def.name = name;
        registry.enums.set(name, target);
      }

      if (target instanceof TruthModel) {
        if (target.def.includes.length) continue;
        target.def.name = name;
        registry.models.set(name, target);
      }
    }
  }
}
export { import_ as import };
