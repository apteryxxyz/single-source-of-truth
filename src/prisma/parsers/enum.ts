import { ZodEffects, ZodLazy, type ZodTypeAny } from 'zod';
import { TruthEnum } from '~/schema/enum';

export interface PrismaEnum {
  name: string;
  values: string[];
}

export function parseEnum(name: string, schema: ZodTypeAny): PrismaEnum {
  let current: typeof schema = ZodLazy.create(() => schema);
  while (!(current instanceof TruthEnum)) {
    if (current instanceof ZodLazy) current = current._def.getter();
    else if (current instanceof ZodEffects) current = current._def.schema;
    else if (!current) return { name, values: [] };
  }

  const values = current.options;
  return { name, values };
}
