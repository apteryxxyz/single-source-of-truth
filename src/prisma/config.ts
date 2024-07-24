import { resolve } from 'node:path';
import { z } from 'zod';

export const Config = z.object({
  output: z.string().transform((v) => resolve(v)),
  enums: z.record(z.instanceof(z.ZodType)).optional(),
  models: z.record(z.instanceof(z.ZodType)).optional(),
});
function config(config: z.input<typeof Config>) {
  return { prisma: config };
}

export default config;
