import type { AnyTruthEnum } from '~/schema/enum';

export interface PrismaEnum {
  name: string;
  values: string[];
}

export function parseEnum(name: string, schema: AnyTruthEnum): PrismaEnum {
  return { name, values: schema.Values };
}
