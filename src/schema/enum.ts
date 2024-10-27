import { ZodEnum, type ZodEnumDef, ZodFirstPartyTypeKind } from 'zod';

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface EnumContext {}
export const EnumContext = {};

//

export interface TruthEnumDef<
  TName extends string,
  TValues extends [string, ...string[]],
> extends ZodEnumDef<TValues> {
  enumName: TName;
}

// @ts-ignore
export class TruthEnum<
  TName extends string,
  const TValues extends [string, ...string[]],
> extends ZodEnum<TValues> {
  protected _ = 0;
  declare _def: TruthEnumDef<TName, TValues>;

  constructor(def: TruthEnumDef<TName, TValues>) {
    super(def);
    Reflect.set(EnumContext, def.enumName, this);
  }

  static override create<
    TTName extends string,
    const TTValues extends [string, ...string[]],
  >(name: TTName, values: TTValues) {
    const enum_ = new TruthEnum<TTName, TTValues>({
      typeName: ZodFirstPartyTypeKind.ZodEnum,
      enumName: name,
      values,
    });

    return Object.assign(enum_, enum_.Values);
  }
}
