import type * as z from 'zod/v4';
import type { Standard } from '~/standard';
import type { TruthEnumDef } from '../schemas/enum.js';
import type { TruthModelDef } from '../schemas/model.js';

export function parseFieldSchema(name: string, schema: z.ZodType) {
  const { current, attributes } = flattenSchemaChain(schema);
  const [kind, type] = resolveKindAndType(current.def);
  return { name, kind, type, attributes } as Standard.Model.Field;
}

function flattenSchemaChain(schema: z.ZodType) {
  const attributes: Standard.Model.Field.Attributes = {};

  let current = schema;
  let next: z.ZodType | null = schema;
  while (next) {
    const payload = extractSchemaAttributes(next);
    for (const [key, value] of Object.entries(payload.attributes))
      Reflect.set(attributes, key, value);
    current = payload.current;
    next = payload.next;
  }

  return { current, attributes };
}

function extractSchemaAttributes(schema: z.ZodType) {
  const attributes: Standard.Model.Field.Attributes = {};

  if (schema.def?.[' id']) attributes.id = true;
  if (schema.def?.[' unique']) attributes.unique = true;
  if (schema.def?.[' name']) attributes.name = schema.def[' name'];
  if (schema.def?.[' references'])
    attributes.references = schema.def[' references'];
  if (schema.def.type === 'nullable') attributes.nullable = true;
  if (schema.def.type === 'array') attributes.list = true;

  return {
    current: schema,
    next: unwrapNestedSchema(schema),
    attributes,
  };
}

function unwrapNestedSchema(schema: z.ZodType) {
  if ('unwrap' in schema && typeof schema.unwrap === 'function')
    return schema.unwrap() as z.ZodType;
  if ('element' in schema) return schema.element as z.ZodType;
  return null;
}

function resolveKindAndType(
  def: z.core.$ZodTypeDef,
): [Standard.Model.Field.Kind, Standard.Model.Field.Type] {
  if (def.type === 'enum') {
    const enumDef = def as TruthEnumDef | z.core.$ZodEnumDef;
    if ('name' in enumDef && enumDef.name) return ['enum', enumDef.name];
    return ['scalar', 'string'];
  }

  if (def.type === 'object') {
    const objectDef = def as TruthModelDef | z.core.$ZodObjectDef;
    if ('name' in objectDef && objectDef.name)
      return ['object', objectDef.name];
    return ['scalar', 'object'];
  }

  if (def.type === 'string') return ['scalar', 'string'];
  if (def.type === 'number') {
    const numberDef = def as z.core.$ZodNumberFormatDef;
    console.log(numberDef);
    return numberDef.format === 'safeint'
      ? ['scalar', 'integer']
      : ['scalar', 'float'];
  }
  if (def.type === 'boolean') return ['scalar', 'boolean'];
  if (def.type === 'date') return ['scalar', 'date'];
  if (def.type === 'bigint') return ['scalar', 'bigint'];

  throw new Error(`Failed to resolve type for ${def.type}`);
}
