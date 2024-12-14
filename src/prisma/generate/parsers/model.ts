import { ZodType } from 'zod';
import type { AnyTruthModel } from '~/schema/model';
import { Id, Index, Unique } from '~/schema/symbols';
import { type PrismaField, parseField } from './field';

export interface PrismaModel {
  name: string;
  fields: PrismaField[];
  attributes: {
    id?: string[];
    unique?: string[][];
    index?: string[][];
  };
}

export function parseModel(name: string, model: AnyTruthModel): PrismaModel {
  const shape = model.shape;

  const fields = Object.entries(shape)
    .filter(([, v]) => v instanceof ZodType)
    .map(([k, v]) => parseField(k, v));

  const attributes = {
    id: shape[Id] as string[],
    unique: shape[Unique] as string[][],
    index: shape[Index] as string[][],
  };

  return { name, fields, attributes };
}
