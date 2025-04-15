import { mkdir as makeDirectory, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import logger from '~/logger.js';
import type { Registry } from '~/registry.js';
import { buildSchema } from './builders/schema.js';

export async function build(registry: Registry, relativePath: string) {
  const url = pathToFileURL(relativePath).toString();
  const path = fileURLToPath(url);

  const enums = registry.enums.getAll();
  const models = registry.models.getAll();
  const schema = buildSchema({ enums, models });

  const count = (count: number, word: string) =>
    `${count} ${word}${count !== 1 ? 's' : ''}`;
  logger.info(
    `Writing prisma schema with ${count(enums.length, 'enum')} and` +
      ` ${count(models.length, 'model')} models to '${relativePath}'...`,
  );
  await makeDirectory(dirname(path), { recursive: true });
  await writeFile(path, schema);
}
