import type { ZodEnum } from 'zod';
import type { Any } from '../types';

export interface Enums extends Record<string, AnyEnum> {}
export const Enums = {};

export type Enum<TSchema extends ZodEnum<Any>> = TSchema & TSchema['Values'];
export type AnyEnum = Enum<ZodEnum<Any>>;

export function createEnum<TSchema extends ZodEnum<Any>>(
  name: string,
  schema: TSchema,
): Enum<TSchema> {
  const ēnum = Object.assign(schema, schema.Values);
  Reflect.set(Enums, name, ēnum);
  return ēnum;
}
