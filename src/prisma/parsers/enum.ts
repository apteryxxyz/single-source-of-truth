import { z } from 'zod';
import attr from '~/attributes';
import type { EnumAttributes } from '../attributes';
import { type Value, parseValue } from './value';

export interface Enum {
  name: string;
  values: Value[];
  attributes: z.output<typeof EnumAttributes>;
}

export function parseEnum(name: string, schema: z.ZodTypeAny) {
  let attributes: Enum['attributes'] = {};
  const applyAttributes = (s: z.ZodTypeAny) =>
    (attributes = Object.assign({}, attr.get(s).prisma_enum, attributes));

  let current: typeof schema = z.lazy(() => schema);
  while (!(current instanceof z.ZodEnum)) {
    if (current instanceof z.ZodLazy) current = current._def.getter();
    else if (current instanceof z.ZodEffects) current = current._def.schema;
    else if (!current) return { name, values: [], attributes };
    applyAttributes(current);
  }
  applyAttributes(current);

  const values = current.options.map(parseValue);
  return { name, values, attributes };
}
