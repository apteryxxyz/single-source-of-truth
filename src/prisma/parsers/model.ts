import { ZodEffects, ZodIntersection, ZodLazy, type ZodTypeAny } from 'zod';
import logger from '~/logger';
import { TruthModel } from '~/schema/model';
import { IdSymbol, IndexSymbol } from '~/schema/symbols';
import { type PrismaField, parseField } from './field';

export interface PrismaModel {
  name: string;
  fields: PrismaField[];
  attributes: {
    id?: [string, ...string[]];
    index?: [string, ...string[]];
  };
}

export function parseModel(name: string, schema: ZodTypeAny): PrismaModel {
  let current: typeof schema = ZodLazy.create(() => schema);
  while (!(current instanceof TruthModel)) {
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

  const shape = current._def.fullShape();
  const attributes = { id: shape[IdSymbol], index: shape[IndexSymbol] };

  const fields = Object.entries(shape) //
    .filter(([k]) => typeof k === 'string')
    .map(([k, v]) => parseField(k, v as ZodTypeAny));

  return { name, fields, attributes };
}
