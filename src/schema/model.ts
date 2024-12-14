import './prototype';

import {
  type TypeOf,
  ZodIntersection,
  ZodLazy,
  ZodObject,
  ZodType,
  type ZodTypeAny,
  type ZodTypeDef,
} from 'zod';
import {
  type AnyTruthRelation,
  type ResolveRelationSchema,
  type WrapRelationSchema,
  isRelation,
  resolveRelationSchema,
  wrapRelationSchema,
} from './relation';
import { Id, Index, Unique } from './symbols';

export interface Models extends Record<string, AnyTruthModel> {}
export const Models: Models = {};

//

export type ModelRawShape =
  | {
      [Id]?: [string, ...string[]];
      [Unique]?: string[][];
      [Index]?: string[][];
    }
  | {
      [key: string]: ZodTypeAny;
    };

//

export type GetRelationKeys<TShape extends ModelRawShape> = {
  [K in keyof TShape]: TShape[K] extends AnyTruthRelation ? K : never;
}[keyof TShape];

export function getRelationKeys<TShape extends ModelRawShape>(shape: TShape) {
  return Object.keys(shape).filter((k) =>
    isRelation(shape[k as never]),
  ) as GetRelationKeys<TShape>[];
}

//

export type MakeZodRawShape<TShape extends ModelRawShape> = Omit<
  {
    [K in keyof TShape]: TShape[K] extends ZodTypeAny ? TShape[K] : never;
  },
  Id | Unique | Index | GetRelationKeys<TShape>
>;

export function makeZodRawShape<TShape extends ModelRawShape>(shape: TShape) {
  return Object.entries(shape).reduce(
    (acc, [k, v]) => {
      if (isRelation(v)) return acc;
      if (k === Id || k === Unique || k === Index) return acc;
      Reflect.set(acc, k, v);
      return acc;
    },
    {} as MakeZodRawShape<TShape>,
  );
}

//

export interface TruthModelDef<
  TName extends string,
  TShape extends ModelRawShape,
  TSchema extends ZodTypeAny = ZodObject<MakeZodRawShape<TShape>>,
> extends ZodTypeDef {
  typeName: 'TruthModel';
  name: TName;
  shape(): TShape;
  schema(): TSchema;
}

export class TruthModel<
  TName extends string,
  TShape extends ModelRawShape,
  TSchema extends ZodTypeAny = ZodObject<MakeZodRawShape<TShape>>,
> extends ZodType<TypeOf<TSchema>, TruthModelDef<TName, TShape, TSchema>> {
  constructor(def: TruthModelDef<TName, TShape, TSchema>) {
    super(def);
    Reflect.set(Models, def.name, this);
  }

  override _parse(input: unknown) {
    return this._def.schema().parse(input);
  }

  get shape() {
    return this._def.shape();
  }

  get schema() {
    return this._def.schema();
  }

  with<
    TInclude extends GetRelationKeys<TShape>,
    TRelation extends
      AnyTruthRelation = TShape[TInclude] extends AnyTruthRelation
      ? TShape[TInclude]
      : never,
    // @ts-ignore
    TType extends ZodTypeAny = ResolveRelationSchema<TRelation>,
    TOverride extends ZodTypeAny = TType,
  >(
    include: TInclude,
    override: (schema: TType) => TOverride = (s) => s as never,
  ): ZodLazy<
    ZodIntersection<
      typeof this,
      ZodObject<Record<TInclude, WrapRelationSchema<TRelation, TOverride>>>
    >
  > {
    return ZodLazy.create(() => {
      const shape = this._def.shape();
      const relation = shape[include] as AnyTruthRelation;
      const schema = wrapRelationSchema(
        relation,
        // @ts-ignore
        override(resolveRelationSchema(relation)),
      );

      return ZodIntersection.create(
        this,
        ZodObject.create({ [include]: schema }),
      ) as never;
    });
  }

  static create<
    TName extends string,
    TShape extends ModelRawShape,
    TSchema extends ZodTypeAny = ZodObject<MakeZodRawShape<TShape>>,
  >(name: TName, things: TShape | [TShape, TSchema]) {
    const shape = Array.isArray(things) ? things[0] : things;
    const schema = (
      Array.isArray(things)
        ? things[1]
        : ZodObject.create(makeZodRawShape(shape))
    ) as TSchema;

    return new TruthModel<TName, TShape, TSchema>({
      typeName: 'TruthModel',
      name,
      shape: () => shape,
      schema: () => schema,
    });
  }
}

export type AnyTruthModel = TruthModel<string, ModelRawShape, ZodTypeAny>;

export const createModel = TruthModel.create;
