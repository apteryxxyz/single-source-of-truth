import * as z from 'zod/v4';
import type { Standard } from '~/standard.js';
import { parseEnumSchema } from '../resolvers/enum.js';

export interface TruthEnumDef<
  Values extends z.core.util.EnumLike = z.core.util.EnumLike,
> extends z.core.$ZodEnumDef<Values> {
  name: string | null;
}

export interface TruthEnumInternals<
  Values extends z.core.util.EnumLike = z.core.util.EnumLike,
> extends z.core.$ZodEnumInternals<Values> {
  def: TruthEnumDef<Values>;
}

export interface TruthEnum<Values extends readonly string[] = readonly string[]>
  extends z.ZodEnum<z.core.util.ToEnum<Values[number]>> {
  _zod: TruthEnumInternals<z.core.util.ToEnum<Values[number]>>;
  def: TruthEnumDef<z.core.util.ToEnum<Values[number]>>;

  this: this & this['enum'];
  values: Values;
  toStandard(): Standard.Enum;
}

export const TruthEnum: z.core.$constructor<TruthEnum> = z.core.$constructor(
  'TruthEnum',
  (inst, def) => {
    z.ZodEnum.init(inst as any, def);

    inst.values = Object.values(inst.enum);
    inst.enum = Object.fromEntries(inst.values.map((v) => [v, v]));
    inst.this = Object.assign(inst, inst.enum);
    inst.toStandard = () => parseEnumSchema(def.name ?? '', inst);
  },
);

function enum_<const Values extends readonly string[]>(
  values: Values,
): TruthEnum<Values>['this'] {
  return new TruthEnum({
    type: 'enum',
    name: null,
    entries: Object.fromEntries(values.map((v) => [v, v])),
  }).this as any;
}
export { enum_ as enum };
