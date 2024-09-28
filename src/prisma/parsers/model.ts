import { z } from 'zod';
import attr from '~/attributes';
import logger from '~/logger';
import type { ModelAttributes } from '../attributes';
import type { Enum } from './enum';
import { type Field, parseField } from './field';

export interface Model {
  name: string;
  fields: Field[];
  attributes: z.output<typeof ModelAttributes>;
}

export function parseModel(
  context: { models: Model[]; enums: Enum[] },
  name: string,
  schema: z.ZodTypeAny,
): Model {
  let attributes: Model['attributes'] = {};
  const applyAttributes = (s: z.ZodTypeAny) =>
    (attributes = Object.assign({}, attr.get(s).prisma_model, attributes));

  let current: typeof schema = z.lazy(() => schema);
  while (!(current instanceof z.ZodObject)) {
    if (current instanceof z.ZodLazy) {
      current = current._def.getter();
    } else if (current instanceof z.ZodEffects) {
      current = current._def.schema;
    } else {
      logger.warn(
        `Encountered an unexpected schema '${current._def.typeName}' for the model '${name}', attempting to skip`,
      );
      current =
        current._def.innerType || current._def.type || current._def.schema;
      if (!current) {
        logger.error(
          `Failed to parse the model '${name}', could not resolve schema`,
        );
        process.exit(1);
      }
    }
    applyAttributes(current);
  }
  applyAttributes(current);

  const fields = Object.entries(current.shape) //
    .map(([k, v]) => parseField(context, k, v as z.ZodTypeAny));
  if (fields.some((f) => Reflect.get(f.attributes, 'relation'))) {
    logger.error('Relation fields should only be defined in relations schemas');
    process.exit(1);
  }

  const relations = Object.entries(schema) //
    .filter(([k]) => k.startsWith('With'));
  for (const [name, schema] of relations) {
    let current = schema;
    while (!(current instanceof z.ZodObject)) {
      if (current instanceof z.ZodLazy) current = current._def.getter();
      if (current instanceof z.ZodEffects) current = current._def.schema;
    }

    const keys = Object.keys(current.shape) //
      .filter((k) => !fields.some((f) => f.name === k));
    if (keys.length !== 1) {
      console.warn(
        `Expected a single unique field in the relation schema '${name}', skipping`,
      );
      continue;
    }

    {
      const [name, schema] = [keys[0]!, current.shape[keys[0]!]];
      fields.push(parseField(context, name, schema as z.ZodTypeAny));
    }
  }

  return { name, fields, attributes };
}
