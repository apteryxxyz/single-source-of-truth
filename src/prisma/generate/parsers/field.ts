import {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodEnum,
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
import { Enums } from '~/schema/enum';
import type { ModelOptions } from '~/schema/model';
import type { AnyRelation } from '~/schema/relation';

export interface PrismaField {
  name: string;
  type: string;
  attributes: {
    id?: boolean;
    unique?: boolean;
    list?: boolean;
    nullable?: boolean;
    updatedAt?: boolean;
    default?: () => unknown;
    relation?: [string[], string[]];
  };
}

export function parseField(
  name: string,
  schema: ZodTypeAny,
  options: ModelOptions<ZodTypeAny>,
): PrismaField {
  const attributes: PrismaField['attributes'] = {};
  if (options.id.length === 1 && options.id[0] === name) attributes.id = true;
  if (options.unique?.includes(name)) attributes.unique = true;
  if (options.updatedAt?.includes(name)) attributes.updatedAt = true;

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
      current instanceof ZodEnum
    )
  ) {
    if (current instanceof ZodLazy) {
      current = current._def.getter();
    } else if (current instanceof ZodEffects) {
      current = current._def.schema;
    } else if (current instanceof ZodArray) {
      current = current._def.type;
      attributes.list = true;
    } else if (current instanceof ZodTuple) {
      current = current._def.items[0];
      attributes.list = true;
    } else if (current instanceof ZodNullable) {
      current = current._def.innerType;
      attributes.nullable = true;
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
  }

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
  } else if (current instanceof ZodEnum) {
    const found = Object.entries(Enums).find(([_, e]) => e === current);
    if (found) type = found[0]!;
    else type = 'String';
  } else {
    logger.error(
      `Failed to parse the field '${name}', could not determine type`,
    );
    process.exit(1);
  }

  return { name, type, attributes };
}

export function parseRelationField(
  name: string,
  relation: AnyRelation,
): PrismaField {
  return {
    name,
    type: relation.name,
    attributes: {
      list: relation.list,
      nullable: relation.nullable,
      relation: relation.fields &&
        relation.references && [relation.fields, relation.references],
    },
  };
}
