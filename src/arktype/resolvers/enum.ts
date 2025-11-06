import type { Standard } from '~/standard.js';
import type { Enum } from '../schemas/enum.js';

export function parseEnum(name: string, schema: Enum<any>): Standard.Enum {
  return {
    name,
    values: schema.truth.values.map((v: string) => ({ name: v })),
  };
}
