import * as z from 'zod';
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

  Enum: this & this['enum'];
  Values: Values;
  toStandard(): Standard.Enum;
}

export const TruthEnum: z.core.$constructor<TruthEnum> = z.core.$constructor(
  'TruthEnum',
  (inst, def) => {
    z.ZodEnum.init(inst as any, def);

    inst.Values = Object.values(inst.enum);
    inst.enum = Object.fromEntries(inst.Values.map((v) => [v, v]));
    inst.Enum = Object.assign(inst, inst.enum);
    inst.toStandard = () => parseEnumSchema(def.name ?? '', inst);
  },
);

export function enum_<const Values extends readonly string[]>(
  values: Values,
): TruthEnum<Values>['Enum'] {
  return new TruthEnum({
    type: 'enum',
    name: null,
    entries: z.core.util.getValidEnumValues(values),
  }).Enum as any;
}
export { enum_ as enum };
