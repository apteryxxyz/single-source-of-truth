import { ZodEnum, type ZodEnumDef, ZodFirstPartyTypeKind } from 'zod';
import type { Any } from '~/types';

export interface Enums extends Record<string, AnyTruthEnum> {}
export const Enums: Enums = {};

export interface TruthEnumDef<
  TName extends string | null,
  TValues extends [string, ...string[]],
> extends ZodEnumDef<TValues> {
  name: TName;
}

export class TruthEnum<
  TName extends string | null,
  const TValues extends [string, ...string[]],
> extends ZodEnum<TValues> {
  declare _def: TruthEnumDef<TName, TValues>;

  constructor(def: TruthEnumDef<TName, TValues>) {
    super(def);
    if (def.name) Reflect.set(Enums, def.name, this);
  }

  static override create<
    TTName extends string | null,
    const TTValues extends [string, ...string[]],
  >(name: TTName, values: TTValues) {
    const enum_ = new TruthEnum<TTName, TTValues>({
      typeName: ZodFirstPartyTypeKind.ZodEnum,
      name: name,
      values,
    });
    return Object.assign(enum_, enum_.Enum);
  }

  // @ts-ignore
  override get Values() {
    return this._def.values;
  }
}

export type AnyTruthEnum = TruthEnum<Any, Any>;

export const createEnum = TruthEnum.create;
