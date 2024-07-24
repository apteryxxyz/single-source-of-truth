import { z } from 'zod';
import type { Context } from '~/types';
import { type Value, parseValue } from './value';

export interface Enum {
  name: string;
  values: Value[];
  attributes: Partial<{ map: string }>;
}

export function parseEnum(
  _context: Context,
  name: string,
  schema: z.ZodTypeAny,
): Enum {
  const attributes: Enum['attributes'] = {};
  const options: Exclude<
    (typeof z.ZodEnum)['prototype']['__enum__'],
    undefined
  > = {};
  function setOptions(s: z.ZodTypeAny) {
    if ('__enum__' in s && s.__enum__)
      for (const k of Object.keys(s.__enum__))
        Reflect.set(options, k, Reflect.get(s.__enum__, k));
  }

  let current: typeof schema = z.lazy(() => schema);
  while (!(current instanceof z.ZodEnum)) {
    if (current instanceof z.ZodLazy) current = current._def.getter();
    else if (current instanceof z.ZodEffects) current = current._def.schema;
    else if (!current) return { name, values: [], attributes };
    setOptions(current);
  }
  setOptions(current);

  if (options.map) attributes.map = options.map;
  const values = current.options.map(parseValue);
  return { name, values, attributes };
}
