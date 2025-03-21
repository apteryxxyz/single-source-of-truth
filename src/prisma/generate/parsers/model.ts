import { ZodType, type ZodTypeAny } from 'zod';
import type { AnyTruthModel } from '~/schema/model';
import { Id, Index, Map, Unique } from '~/schema/symbols';
import { type PrismaField, parseField } from './field';

export interface PrismaModel {
  name: string;
  fields: PrismaField[];
  attributes: {
    id?: { fields: string[]; name?: string; map?: string };
    unique?: { fields: string[]; name?: string; map?: string }[];
    index?: { fields: string[]; name?: string; map?: string }[];
    map?: string;
  };
}

export function parseModel(name: string, model: AnyTruthModel): PrismaModel {
  const shape = model.shape;

  const fields = Object.entries(shape)
    .filter(([, v]) => v instanceof ZodType)
    .map(([k, v]) => parseField(k, v));

  const attributes: PrismaModel['attributes'] = {};

  if (shape[Id]) {
    const id = shape[Id] as Exclude<(typeof shape)[Id], ZodTypeAny | undefined>;
    if (Array.isArray(id)) attributes.id = { fields: id };
    else attributes.id = id;
  }
  if (shape[Unique]) {
    const unique = shape[Unique] as Exclude<
      (typeof shape)[Unique],
      ZodTypeAny | undefined
    >;
    attributes.unique ??= [];
    for (const u of unique)
      if (Array.isArray(u)) attributes.unique?.push({ fields: u });
      else attributes.unique?.push(u);
  }
  if (shape[Index]) {
    const index = shape[Index] as Exclude<
      (typeof shape)[Index],
      ZodTypeAny | undefined
    >;
    attributes.index ??= [];
    for (const i of index)
      if (Array.isArray(i)) attributes.index?.push({ fields: i });
      else attributes.index?.push(i);
  }
  if (shape[Map])
    attributes.map = shape[Map] as Exclude<
      (typeof shape)[Map],
      ZodTypeAny | undefined
    >;

  return { name, fields, attributes };
}
