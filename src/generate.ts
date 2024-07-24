import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { z } from 'zod';
import { buildPrismaSchema } from './builders/prisma/schema';
import { parseEnum } from './parsers/enum';
import { parseModel } from './parsers/model';
import { type Context, Options } from './types';

export async function generate(options_: z.input<typeof Options>) {
  const options = Options.parse(options_);

  const globalContext: Context = { models: [], enums: [] };
  for (const prisma of options.prisma) {
    const localContext: Context = { models: [], enums: [] };
    for (const [name, schema] of Object.entries(prisma.enums)) {
      const enum_ = parseEnum(globalContext, name, schema);
      localContext.enums.push(enum_);
      globalContext.enums.push(enum_);
    }
    for (const [name, schema] of Object.entries(prisma.models)) {
      const model = parseModel(globalContext, name, schema);
      localContext.models.push(model);
      globalContext.models.push(model);
    }

    const schema = buildPrismaSchema(localContext);
    await mkdir(dirname(prisma.output), { recursive: true });
    await writeFile(prisma.output, schema);
  }

  return globalContext;
}
