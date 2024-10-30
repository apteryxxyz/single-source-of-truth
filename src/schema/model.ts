import {
  ZodArray,
  ZodFirstPartyTypeKind,
  ZodNever,
  ZodObject,
  type ZodObjectDef,
  type ZodTypeAny,
} from 'zod';
import type { Any } from '../types';
import { TruthMany, type TruthOne, TruthRelation } from './relation';
import { Id, Index } from './symbols';

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface ModelContext {}
export const ModelContext = {};

//

export interface TruthModelDef<
  TName extends string,
  TShape extends ModelRawShape,
  TInclude extends GetRelationKeys<TShape> = never,
> extends ZodObjectDef<MakeZodRawShape<TShape, TInclude>> {
  truthName: TName;
  fullShape: () => TShape;
  include: TInclude[];
}

// @ts-ignore
export class TruthModel<
  TName extends string,
  TShape extends ModelRawShape,
  TInclude extends GetRelationKeys<TShape> = never,
> extends ZodObject<MakeZodRawShape<TShape, TInclude>> {
  declare _def: TruthModelDef<TName, TShape, TInclude>;

  constructor(def: TruthModelDef<TName, TShape, TInclude>) {
    super(def);
    Reflect.set(ModelContext, def.truthName, this);
  }

  static override create<TTName extends string, TTShape extends ModelRawShape>(
    name: TTName,
    shape: TTShape,
  ) {
    return new TruthModel<TTName, TTShape>({
      truthName: name,
      typeName: ZodFirstPartyTypeKind.ZodObject,
      fullShape: () => shape,
      shape: () => makeZodRawShape(shape),
      include: [],
      catchall: ZodNever.create(),
      unknownKeys: 'strip',
    });
  }

  with<TTInclude extends Exclude<GetRelationKeys<TShape>, TInclude>>(
    ...include: [TTInclude, ...TTInclude[]]
  ) {
    return new TruthModel<TName, TShape, TInclude | TTInclude>({
      ...this._def,
      include: [...this._def.include, ...include],
      shape: () =>
        makeZodRawShape(
          this._def.fullShape(),
          ...[...this._def.include, ...include],
        ),
    });
  }
}

//

export type ModelRawShape =
  | {
      [Id]?: [string, ...string[]];
      [Index]?: [string, ...string[]];
    }
  | { [key: string]: ZodTypeAny };

export type MakeZodRawShape<
  TShape extends ModelRawShape,
  TInclude extends GetRelationKeys<TShape>,
> = Omit<TShape, Id | Index | GetRelationKeys<TShape>> & {
  [K in TInclude]: TShape[K] extends TruthMany<infer TModelName>
    ? ZodArray<ModelContext[TModelName]>
    : TShape[K] extends TruthOne<infer TModelName>
      ? ModelContext[TModelName]
      : never;
};

export function makeZodRawShape<
  TShape extends ModelRawShape,
  TInclude extends GetRelationKeys<TShape>,
>(shape: TShape, ...include: TInclude[]) {
  const relationKeys = getRelationKeys(shape);
  return Object.entries(shape).reduce(
    (acc, [key, value]) => {
      if (key === Id || key === Index) {
        return acc;
      } else if (relationKeys.includes(key)) {
        if (include.includes(key as TInclude)) {
          // @ts-ignore
          const relation = shape[key as TInclude] as TruthRelation<Any, Any>;
          let schema = (ModelContext as Any)[relation._def.modelName];
          if (relation instanceof TruthMany) schema = ZodArray.create(schema);
          return Object.assign(acc, { [key]: schema });
        } else {
          return acc;
        }
      } else {
        return Object.assign(acc, { [key]: value });
      }
    },
    {} as MakeZodRawShape<TShape, TInclude>,
  );
}

export type GetRelationKeys<TShape extends ModelRawShape> = {
  // @ts-ignore
  [K in keyof TShape]: TShape[K] extends TruthRelation<Any, Any> ? K : never;
}[keyof TShape];

export function getRelationKeys<TShape extends ModelRawShape>(shape: TShape) {
  return Object.keys(shape).filter(
    (k) => shape[k as keyof TShape] instanceof TruthRelation,
  );
}
