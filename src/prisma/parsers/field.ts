import {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodLazy,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodRecord,
  ZodString,
  ZodTuple,
  ZodUnknown,
  type ZodTypeAny,
} from 'zod';
import logger from '~/logger';
import { TruthEnum } from '~/schema/enum';
import { TruthMany, TruthRelation } from '~/schema/relation';
import { Id, Index, Unique, UpdatedAt } from '~/schema/symbols';

export interface PrismaField {
  name: string;
  type: string;
  attributes: {
    id?: boolean;
    unique?: boolean;
    index?: boolean;
    list?: boolean;
    nullable?: boolean;
    updatedAt?: boolean;
    default?: () => unknown;
    relation?: [string[], string[]];
  };
}

export function parseField(name: string, schema: ZodTypeAny): PrismaField {
  const attributes: PrismaField['attributes'] = {};
  const applyAttributes = (s: ZodTypeAny) => {
    attributes.id = s._def[Id] === true;
    attributes.unique = s._def[Unique] === true;
    attributes.index = s._def[Index] === true;
    attributes.updatedAt = s._def[UpdatedAt] === true;
  };

  let current: typeof schema = ZodLazy.create(() => schema);
  while (
    !(
      current instanceof ZodBoolean ||
      current instanceof ZodNumber ||
      current instanceof ZodString ||
      current instanceof ZodDate ||
      current instanceof ZodObject ||
      current instanceof ZodRecord ||
      current instanceof ZodUnknown ||
      current instanceof TruthRelation ||
      current instanceof TruthEnum
    )
  ) {
    if (current instanceof ZodLazy) {
      current = current._def.getter();
    } else if (current instanceof ZodEffects) {
      current = current._def.schema;
    } else if (current instanceof ZodArray) {
      current = current._def.type;
      attributes.list = true;
    } else if (current instanceof ZodNullable) {
      current = current._def.innerType;
      attributes.nullable = true;
    } else if (current instanceof ZodTuple) {
      current = current._def.items[0];
      attributes.list = true;
    } else if (current instanceof ZodDefault) {
      attributes.default = current._def.defaultValue;
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
  if (current instanceof ZodString) {
    type = 'String';
  } else if (current instanceof ZodNumber) {
    if (current._def.checks.some((c) => c.kind === 'int')) type = 'Int';
    else type = 'Float';
  } else if (current instanceof ZodBoolean) {
    type = 'Boolean';
  } else if (current instanceof ZodDate) {
    type = 'DateTime';
  } else if (
    current instanceof ZodObject ||
    current instanceof ZodRecord ||
    current instanceof ZodUnknown
  ) {
    type = 'Json';
  } else if (current instanceof TruthRelation) {
    type = current._def.modelName;
    if (current instanceof TruthMany) attributes.list = true;

    if (current._def.fieldName && current._def.relatedFieldName)
      attributes.relation = [
        current._def.fieldName,
        current._def.relatedFieldName,
      ];
  } else if (current instanceof TruthEnum) {
    type = current._def.truthName;
  } else {
    logger.error(
      `Failed to parse the field '${name}', could not determine type`,
    );
    process.exit(1);
  }

  return { name, type, attributes };
}
