import { z } from 'zod';
import type { Context } from '~/types';
import { type Field, parseField } from './field';

export interface Model {
  name: string;
  fields: Field[];
  attributes: Partial<{
    map: string;
    id: string[];
    index: string[];
    comment: string;
  }>;
}

export function parseModel(
  context: Context,
  name: string,
  schema: z.ZodTypeAny,
): Model {
  const attributes: Model['attributes'] = {};
  const options: Exclude<
    (typeof z.ZodObject)['prototype']['__model__'],
    undefined
  > = {};
  function setOptions(s: z.ZodTypeAny) {
    if ('__model__' in s && s.__model__)
      for (const k of Object.keys(s.__model__))
        Reflect.set(options, k, Reflect.get(s.__model__, k));
    if (s.description) attributes.comment = s.description;
  }

  let current: typeof schema = z.lazy(() => schema);
  while (!(current instanceof z.ZodObject)) {
    if (current instanceof z.ZodLazy) {
      current = current._def.getter();
    } else if (current instanceof z.ZodEffects) {
      current = current._def.schema;
    } else {
      console.warn(`Unexpected schema type: ${current.constructor.name}`);
      current =
        current._def.innerType || current._def.type || current._def.schema;
      if (!current) return { name, fields: [], attributes };
    }
    setOptions(current);
  }
  setOptions(current);

  if (options.id) attributes.id = options.id;
  if (options.index) attributes.index = options.index;
  if (options.map) attributes.map = options.map;

  const fields = Object.entries(current.shape) //
    .map(([k, v]) => parseField(context, k, v as z.ZodTypeAny));
  if (fields.some((f) => f.attributes.relation))
    throw new Error('Relation fields should only be defined in relations');

  const relations = Object.entries(schema) //
    .filter(([k]) => k.startsWith('With'));
  for (const [, relation] of relations) {
    let current = relation;
    while (!(current instanceof z.ZodObject)) {
      if (current instanceof z.ZodEffects) current = current._def.schema;
      else if (current instanceof z.ZodLazy) current = current._def.getter();
    }

    const keys = Object.keys(current.shape) //
      .filter((k) => !fields.some((f) => f.name === k));
    if (keys.length !== 1)
      throw new Error('Expected exactly one field in relation');
    const [name, schema] = [keys[0]!, current.shape[keys[0]!] as z.ZodTypeAny];
    fields.push(parseField(context, name, schema as z.ZodTypeAny));
  }

  return { name, fields, attributes };
}
