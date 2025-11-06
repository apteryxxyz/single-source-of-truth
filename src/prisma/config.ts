import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import logger from '~/logger.js';
import type { Registry } from '~/registry.js';
import { buildSchema } from './builders/schema';

async function export_(registry: Registry, path: `${string}.prisma`) {
  const schema = buildSchema(registry.toTruth());
  const count = (c: number, w: string) => `${c} ${w}${c !== 1 ? 's' : ''}`;
  logger.info(
    `Writing prisma schema with ${count(registry.enums.size, 'enum')} and ${count(registry.models.size, 'model')} to '${path}'...`,
  );

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, schema);
}
export { export_ as export };
