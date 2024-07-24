import { z } from 'zod';
import attr from '~/attributes';
import logger from '~/logger';
import type { FieldAttributes, FieldRelationAttributes } from '../attributes';
import type { Enum } from './enum';
import type { Model } from './model';

export interface Field {
  name: string;
  type: string | (() => string);
  attributes: z.output<typeof FieldAttributes> &
    z.output<typeof FieldRelationAttributes>;
}

export function parseField(
  context: { models: Model[]; enums: Enum[] },
  name: string,
  schema: z.ZodTypeAny,
): Field {
  // @ts-ignore
  let attributes: Field['attributes'] = {};
  const applyAttributes = (s: z.ZodTypeAny) =>
    (attributes = Object.assign({}, attr.get(s).prisma_field, attributes));

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
    } else if (current instanceof z.ZodNullable) {
      attributes.nullable = true;
      current = current._def.innerType;
    } else {
      logger.warn(
        `Encountered an unexpected schema type '${current._def.typeName}' for the field '${name}', attempting to skip`,
      );
      current = current._def.innerType || current._def.type;
      if (!current) {
        logger.error(
          `Failed to parse the field '${name}', could not resolve schema`,
        );
        process.exit(1);
      }
    }
    applyAttributes(current);
  }
  applyAttributes(current);

  let type = undefined;
  if (current instanceof z.ZodString) {
    type = 'String';
  } else if (current instanceof z.ZodNumber) {
    if (current._def.checks.some((c) => c.kind === 'int')) type = 'Int';
    else type = 'Float';
  } else if (current instanceof z.ZodBoolean) {
    type = 'Boolean';
  } else if (current instanceof z.ZodDate) {
    type = 'DateTime';
  } else if (current instanceof z.ZodObject) {
    type = () => {
      const found = context.models.find((m) => {
        const l = Object.keys(current.shape);
        const r = m.fields.map((f) => f.name);
        return l.every((k) => r.includes(k));
      });
      return found ? found.name : 'Json';
    };
  } else if (current instanceof z.ZodEnum) {
    type = () => {
      const values = current.options.map(String);
      const found = context.enums //
        .find((e) => e.values.every((v) => values.includes(String(v))));
      return found ? found.name : 'String';
    };
  } else {
    logger.error(
      `Failed to parse the field '${name}', could not determine type`,
    );
    process.exit(1);
  }

  return { name, type, attributes };
}
