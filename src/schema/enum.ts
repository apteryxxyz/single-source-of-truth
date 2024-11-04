import { ZodEnum, type ZodEnumDef, ZodFirstPartyTypeKind } from 'zod';

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface Enums {}
export const Enums = {};

//

export interface TruthEnumDef<
  TName extends string | null,
  TValues extends [string, ...string[]],
> extends ZodEnumDef<TValues> {
  truthName: TName;
}

// @ts-ignore
export class TruthEnum<
  TName extends string | null,
  const TValues extends [string, ...string[]],
> extends ZodEnum<TValues> {
  protected _ = 0;
  declare _def: TruthEnumDef<TName, TValues>;

  constructor(def: TruthEnumDef<TName, TValues>) {
    super(def);
    if (def.truthName) Reflect.set(Enums, def.truthName, this);
  }

  static override create<
    TTName extends string | null,
    const TTValues extends [string, ...string[]],
  >(name: TTName, values: TTValues) {
    const enum_ = new TruthEnum<TTName, TTValues>({
      typeName: ZodFirstPartyTypeKind.ZodEnum,
      truthName: name,
      values,
    });

    return Object.assign(enum_, enum_.Values);
  }
}
