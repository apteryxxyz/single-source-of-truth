import type { z } from 'zod';
import attr from '~/attributes';
import type { ValueAttributes } from '../attributes';

export type Value = string & {
  attributes: z.output<typeof ValueAttributes>;
};

export function parseValue(value: string): Value {
  const attributes = //
    Object.assign({}, attr.get(value).prisma_value);
  // biome-ignore lint/performance/noDelete: <explanation>
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  delete (value as any).__attr__;
  return Object.assign(value, { attributes });
}
