import { resolve } from 'node:path';
import { z } from 'zod';
import type { Enum } from './parsers/enum';
import type { Model } from './parsers/model';

export interface Context {
  models: Model[];
  enums: Enum[];
}

export const PrismaOptions = z.object({
  output: z.string().transform((v) => resolve(v)),
  models: z.record(z.string(), z.instanceof(z.ZodType)),
  enums: z.record(z.string(), z.instanceof(z.ZodType)),
});

export const Options = z.object({
  prisma: PrismaOptions.or(PrismaOptions.array()).transform((v) => [v].flat()),
});
