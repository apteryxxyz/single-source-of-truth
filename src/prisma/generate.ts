import { mkdir as makeDirectory, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { z } from 'zod';
import logger from '~/logger';
import { buildPrismaSchema } from './builders/schema';
import { Config } from './config';
import { type Enum, parseEnum } from './parsers/enum';
import { type Model, parseModel } from './parsers/model';

export default async function generate(config_: z.infer<typeof Config>) {
  logger.info('Generating Prisma schema...');

  const config = Config.parse(config_);
  const context: { models: Model[]; enums: Enum[] } = { models: [], enums: [] };

  for (const [name, schema] of Object.entries(config.enums ?? {}))
    context.enums.push(parseEnum(name, schema));
  for (const [name, schema] of Object.entries(config.models ?? {}))
    context.models.push(parseModel(context, name, schema));

  const schema = buildPrismaSchema(context);
  await makeDirectory(dirname(config.output), { recursive: true });
  await writeFile(config.output, schema);
}
