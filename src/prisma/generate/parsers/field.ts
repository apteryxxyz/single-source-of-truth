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
  type ZodTypeAny,
  ZodUnknown,
} from 'zod';
import logger from '~/logger';
import { TruthEnum } from '~/schema/enum';
import { TruthRelation } from '~/schema/relation';
import { Id, Map, Unique, UpdatedAt } from '~/schema/symbols';

export interface PrismaField {
  name: string;
  type: string;
  attributes: {
    id?: boolean;
    unique?: boolean;
    list?: boolean;
    map?: string;
    nullable?: boolean;
    updatedAt?: boolean;
    default?: () => unknown;
    relation?: {
      fields: string[];
      relatedFields: string[];
      map?: string;
    };
  };
}

export function parseField(name: string, schema: ZodTypeAny): PrismaField {
  const attributes: PrismaField['attributes'] = {};

  let current: ZodTypeAny = ZodLazy.create(() => schema);
  while (
    !(
      current instanceof ZodString ||
      current instanceof ZodNumber ||
      current instanceof ZodBoolean ||
      current instanceof ZodDate ||
      current instanceof ZodObject ||
      current instanceof ZodRecord ||
      current instanceof ZodUnknown ||
      current instanceof TruthEnum ||
      current instanceof TruthRelation
    )
  ) {
    if (current instanceof ZodLazy) {
      current = current._def.getter();
    } else if (current instanceof ZodEffects) {
      current = current._def.schema;
    } else if (current instanceof ZodArray) {
      attributes.list = true;
      current = current._def.type;
    } else if (current instanceof ZodTuple) {
      attributes.list = true;
      current = current._def.items[0];
    } else if (current instanceof ZodNullable) {
      attributes.nullable = true;
      current = current._def.innerType;
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

    if (current._def[Id]) attributes.id = true;
    if (current._def[Unique]) attributes.unique = true;
    if (current._def[Map]) attributes.map = current._def[Map];
    if (current._def[UpdatedAt]) attributes.updatedAt = true;
  }

  let type = undefined;
  if (current instanceof ZodString) {
    type = 'String';
  } else if (current instanceof ZodNumber) {
    if (current.isInt) type = 'Int';
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
  } else if (current instanceof TruthEnum) {
    type = current._def.name;
  } else if (current instanceof TruthRelation) {
    type = current._def.modelName;
    if (current._def.relatedFields && current._def.fields)
      attributes.relation = {
        fields: current._def.fields,
        relatedFields: current._def.relatedFields,
        map: current._def.map,
      };
  } else {
    logger.error(
      `Failed to parse the field '${name}', could not determine type`,
    );
    process.exit(1);
  }

  return { name, type, attributes };
}
