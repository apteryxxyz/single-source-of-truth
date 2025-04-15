import type { Standard } from '~/standard';
import type { TruthEnum } from '../schemas/enum.js';

export function parseEnumSchema(name: string, schema: TruthEnum<any>) {
  return {
    name,
    values: schema.Values.map((v: string) => ({ name: v })),
  } as Standard.Enum;
}
