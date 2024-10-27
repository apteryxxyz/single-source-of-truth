import {
  ZodFirstPartyTypeKind,
  ZodNever,
  ZodObject,
  type ZodObjectDef,
  type ZodRawShape,
} from 'zod';
import type { TruthMany, TruthOne, TruthRelation } from './relation';
import { IdSymbol, IndexSymbol } from './symbols';

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface ModelContext {}
export const ModelContext = {};

//

export interface TruthModelDef<
  TName extends string,
  TShape extends ModelRawShape,
  TInclude extends RelationKeys<TShape> = never,
> extends ZodObjectDef<MakeZodRawShape<TShape, TInclude>> {
  modelName: TName;
  fullShape: () => TShape;
}

// @ts-ignore
export class TruthModel<
  TName extends string,
  TShape extends ModelRawShape,
  TInclude extends RelationKeys<TShape> = never,
> extends ZodObject<MakeZodRawShape<TShape, TInclude>> {
  declare _def: TruthModelDef<TName, TShape, TInclude>;

  constructor(def: TruthModelDef<TName, TShape, TInclude>) {
    super(def);
    Reflect.set(ModelContext, def.modelName, this);
  }

  static override create<TTName extends string, TTShape extends ModelRawShape>(
    name: TTName,
    shape: TTShape,
  ) {
    return new TruthModel<TTName, TTShape>({
      modelName: name,
      typeName: ZodFirstPartyTypeKind.ZodObject,
      fullShape: () => shape,
      shape: () => shape,
      catchall: ZodNever.create(),
      unknownKeys: 'strip',
    });
  }

  with<TTInclude extends Exclude<RelationKeys<TShape>, TInclude>>(
    ...keys: [TTInclude, ...TTInclude[]]
  ) {
    return new TruthModel<TName, TShape, TInclude | TTInclude>({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...keys.reduce(
          (acc, key) => {
            // @ts-ignore
            acc[key] = ModelContext[this._def.fullShape()[key].modelName];
            return acc;
          },
          {} as Record<string, unknown>,
        ),
      }),
    } as never);
  }
}

//

export interface ModelRawShape extends ZodRawShape {
  [IdSymbol]?: [string, ...string[]];
  [IndexSymbol]?: [string, ...string[]];
}

export type MakeZodRawShape<
  TShape extends ModelRawShape,
  TInclude extends RelationKeys<TShape> = never,
> = Omit<TShape, typeof IdSymbol | RelationKeys<TShape>> & {
  [K in TInclude]: TShape[K] extends TruthMany<infer TModelName>
    ? ModelContext[TModelName][]
    : TShape[K] extends TruthOne<infer TModelName>
      ? ModelContext[TModelName]
      : never;
};

export type RelationKeys<TShape extends ModelRawShape> =
  keyof TShape extends infer K
    ? K extends string
      ? // @ts-ignore
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        TShape[K] extends TruthRelation<any, any>
        ? K
        : never
      : never
    : never;
