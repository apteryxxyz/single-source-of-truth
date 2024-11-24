import {
  type TypeOf,
  type ZodArray,
  ZodIntersection,
  ZodLazy,
  ZodObject,
  type ZodTypeAny,
} from 'zod';

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
    TRelation extends TRelations[TInclude] = TRelations[TInclude],
    TType extends ZodTypeAny = Models[TRelation[0]],
    TOverride extends ZodTypeAny = TType,
  >(
    include: TInclude,
    override?: (schema: NoInfer<TType>) => TOverride,
  ): ZodIntersection<
    TSchema,
    ZodObject<
      Record<
        TInclude,
        TRelation extends { length: 1 } ? ZodArray<TOverride> : TOverride
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
> {
  id: [Extract<keyof TShape, string>, ...Extract<keyof TShape, string>[]];
}

export interface ModelRelations {
  [key: string]: [keyof Models] | [keyof Models, string[], string[]];
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
      return ZodIntersection.create(
        schema,
        ZodObject.create({
          [include]: ZodLazy.create(() =>
            override(Models[relations[include]![0]!]!),
          ),
        }),
      );
    },
  });

  Reflect.set(Models, name, model);
  return model as unknown as Model<TSchema, TOptions, TRelations>;
}
