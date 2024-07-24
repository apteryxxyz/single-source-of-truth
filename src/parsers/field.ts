import { z } from 'zod';
import type { Context } from '~/types';

export interface Field {
  name: string;
  type:
    | 'unknown'
    | 'string'
    | 'boolean'
    | 'integer'
    | 'number'
    | 'object'
    | 'date'
    | (() => string);
  attributes: Partial<{
    id: boolean;
    unique: boolean;
    list: boolean;
    optional: boolean;
    nullable: boolean;
    updatedAt: boolean;
    map: string;
    default(): unknown;
    relation: [string[], string[]];
  }>;
}

export function parseField(
  context: Context,
  name: string,
  schema: z.ZodTypeAny,
): Field {
  const attributes: Field['attributes'] = {};
  const options: Exclude<
    (typeof z.ZodString)['prototype']['__field__'],
    undefined
  > = {};
  function setOptions(s: z.ZodTypeAny) {
    if ('__field__' in s && s.__field__)
      for (const k of Object.keys(s.__field__))
        Reflect.set(options, k, Reflect.get(s.__field__, k));
  }

  let current: typeof schema = z.lazy(() => schema);
  while (
    !(
      current instanceof z.ZodBoolean ||
      current instanceof z.ZodNumber ||
      current instanceof z.ZodString ||
      current instanceof z.ZodDate ||
      current instanceof z.ZodObject ||
      current instanceof z.ZodEnum
    )
  ) {
    if (current instanceof z.ZodLazy) {
      current = current._def.getter();
    } else if (current instanceof z.ZodEffects) {
      current = current._def.schema;
    } else if (current instanceof z.ZodDefault) {
      attributes.default = current._def.defaultValue;
      current = current._def.innerType;
    } else if (current instanceof z.ZodArray) {
      attributes.list = true;
      current = current._def.type;
    } else if (current instanceof z.ZodOptional) {
      attributes.optional = true;
      current = current._def.innerType;
    } else if (current instanceof z.ZodNullable) {
      attributes.nullable = true;
      current = current._def.innerType;
    } else {
      console.warn(`Unexpected field schema type: ${current._def.typeName}`);
      current = current._def.innerType || current._def.type;
      if (!current) return { name, type: 'unknown', attributes };
    }
    setOptions(current);
  }
  setOptions(current);

  if (options.id) attributes.id = options.id;
  if (options.unique) attributes.unique = options.unique;
  if (options.map) attributes.map = options.map;
  if (options.updatedAt) attributes.updatedAt = options.updatedAt;
  if (options.relation) attributes.relation = options.relation;

  let type: Field['type'] = 'unknown';
  if (current instanceof z.ZodBoolean) {
    type = 'boolean';
  } else if (current instanceof z.ZodString) {
    type = 'string';
  } else if (current instanceof z.ZodNumber) {
    type = 'number';
  } else if (current instanceof z.ZodDate) {
    type = 'date';
  } else if (current instanceof z.ZodObject) {
    type = () => {
      const found = context.models.find((m) => {
        const l = Object.keys(current.shape);
        const r = m.fields.map((f) => f.name);
        return l.every((k) => r.includes(k));
      });
      return found ? found.name : 'object';
    };
  } else if (current instanceof z.ZodEnum) {
    type = () => {
      const found = context.enums.find((e) =>
        e.values.every((v) => current.options.includes(String(v))),
      );
      return found ? found.name : 'string';

      // const found = context.enums //
      //   .find((e) => e.values.every((v) => current.options.includes(v)));
      // return found ? found.name : 'string';
    };
  }

  return { name, type, attributes };
}
