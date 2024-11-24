import {
  ZodEffects,
  ZodIntersection,
  ZodLazy,
  ZodObject,
  type ZodTypeAny,
} from 'zod';
import logger from '~/logger';
import type { AnyModel } from '~/schema/model';
import { type PrismaField, parseField, parseRelationField } from './field';

export interface PrismaModel {
  name: string;
  fields: PrismaField[];
  attributes: {
    id?: string[];
    unique?: string[][];
    index?: string[][];
  };
}

export function parseModel(name: string, model: AnyModel): PrismaModel {
  const attributes: PrismaModel['attributes'] = {};
  if (model._truth.options.id.length > 1)
    attributes.id = model._truth.options.id;
  if (model._truth.options.unique?.some((u) => Array.isArray(u)))
    attributes.unique = model._truth.options.unique //
      .filter((u) => Array.isArray(u));
  if (model._truth.options.index?.length)
    attributes.index = model._truth.options.index;

  let current: ZodTypeAny = ZodLazy.create(() => model._truth.schema);
  while (!(current instanceof ZodObject)) {
    if (current instanceof ZodLazy) {
      current = current._def.getter();
    } else if (current instanceof ZodEffects) {
      current = current._def.schema;
    } else if (current instanceof ZodIntersection) {
      current = current._def.left;
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
  }

  const shape = current._def.shape();
  const fields = Object.entries(shape) //
    .map(([k, v]) => parseField(k, v as never, model._truth.options))
    .concat(
      Object.entries(model._truth.relations) //
        .map(([k, v]) => parseRelationField(k, v as never)),
    );

  return { name, fields, attributes };
}
