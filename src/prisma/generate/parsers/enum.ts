import type { AnyEnum } from '~/schema/enum';

export interface PrismaEnum {
  name: string;
  values: string[];
}

export function parseEnum(name: string, schema: AnyEnum): PrismaEnum {
  return { name, values: Object.values(schema.Values) };
}
