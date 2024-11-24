import type { Any } from '~/types';
import type { Models } from './model';

export type Relation<TType extends `${keyof Models}${'' | '[]' | '?'}`> = {
  name: TType extends `${infer TName}${'[]' | '?'}` ? TName : TType;
  nullable: TType extends `${infer _}?` ? true : false;
  list: TType extends `${infer _}[]` ? true : false;
  fields?: string[];
  references?: string[];
};
export type AnyRelation = Relation<Any>;

export function createRelation<
  TType extends `${keyof Models}${'' | '[]' | '?'}`,
>(
  type: TType,
  options: {
    fields?: string[];
    references?: string[];
  } = {},
) {
  return {
    name: type.replace('[]', '').replace('?', ''),
    nullable: type.endsWith('?'),
    list: type.endsWith('[]'),
    ...options,
  } as unknown as Relation<TType>;
}
