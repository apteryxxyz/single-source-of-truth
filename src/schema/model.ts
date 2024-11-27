import {
  type TypeOf,
  ZodArray,
  ZodIntersection,
  ZodObject,
  type ZodTypeAny,
} from 'zod';
import type { AnyRelation } from './relation';

export interface Models extends Record<string, AnyModel> {}
export const Models: Models = {};

export type Model<
  TSchema extends ZodTypeAny,
  TOptions extends ModelOptions<TSchema>,
  TRelations extends ModelRelations,
> = TSchema & {
  _truth: {
    schema: TSchema;
    options: TOptions;
    relations: TRelations;
  };
  with<
    TInclude extends keyof TRelations,
    TRelation extends AnyRelation = TRelations[TInclude],
    TType extends ZodTypeAny = Models[TRelation['name']],
    TOverride extends ZodTypeAny = TType,
  >(
    include: TInclude,
    override?: (schema: NoInfer<TType>) => TOverride,
  ): ZodIntersection<
    TSchema,
    ZodObject<
      Record<
        TInclude,
        TRelation['list'] extends true ? ZodArray<TOverride> : TOverride
      >
    >
  >;
};
export type AnyModel = Model<
  ZodTypeAny,
  ModelOptions<ZodTypeAny>,
  ModelRelations
>;

export interface ModelOptions<
  TSchema extends ZodTypeAny,
  TShape extends object = TypeOf<TSchema>,
  TKey extends Extract<keyof TShape, string> = Extract<keyof TShape, string>,
> {
  id: [TKey, ...TKey[]];
  unique?: (TKey | TKey[])[];
  index?: TKey[][];
  updatedAt?: TKey[];
}

export interface ModelRelations {
  [key: string]: AnyRelation;
}

// ==================== //

export function createModel<
  TSchema extends ZodTypeAny,
  const TOptions extends ModelOptions<TSchema>,
  const TRelations extends ModelRelations,
>(name: string, schema: TSchema, options: TOptions, relations: TRelations) {
  const model = Object.assign(schema, {
    _truth: { schema, options, relations },
    with(include: keyof TRelations, override = (s: ZodTypeAny) => s) {
      const relation = relations[include]!;
      const schema = override(Models[relation.name]!);
      const wrapped = relation.list ? ZodArray.create(schema) : schema;
      return ZodIntersection.create(
        schema,
        ZodObject.create({ [include]: wrapped }),
      );
    },
  });

  Reflect.set(Models, name, model);
  return model as unknown as Model<TSchema, TOptions, TRelations>;
}
