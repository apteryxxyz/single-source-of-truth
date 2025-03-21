import {
  INVALID,
  ZodArray,
  ZodNullable,
  ZodType,
  type ZodTypeAny,
  type ZodTypeDef,
} from 'zod';
import { Models } from './model';

export interface TruthRelationDef<TModelName extends keyof Models>
  extends ZodTypeDef {
  typeName: 'TruthRelation';
  modelName: TModelName;
  fields?: string[];
  relatedFields?: string[];
  map?: string;
}

export class TruthRelation<TModelName extends keyof Models> extends ZodType<
  never,
  TruthRelationDef<TModelName>
> {
  override _parse() {
    return INVALID;
  }

  reference(field: string, relatedField: string) {
    return new TruthRelation<TModelName>({
      ...this._def,
      fields: [...(this._def.fields ?? []), field],
      relatedFields: [...(this._def.relatedFields ?? []), relatedField],
    });
  }

  map(name: string) {
    return new TruthRelation<TModelName>({ ...this._def, map: name });
  }


  static create<TModelName extends keyof Models>(modelName: TModelName) {
    return new TruthRelation<TModelName>({
      typeName: 'TruthRelation',
      modelName,
    });
  }
}

export const createRelation = TruthRelation.create;

export type AnyTruthRelation =
  | TruthRelation<keyof Models>
  | ZodNullable<TruthRelation<keyof Models>>
  | ZodArray<TruthRelation<keyof Models>>;

export function isRelation(value: unknown): value is AnyTruthRelation {
  return (
    value instanceof TruthRelation ||
    (value instanceof ZodNullable &&
      value._def.innerType instanceof TruthRelation) ||
    (value instanceof ZodArray && value._def.type instanceof TruthRelation)
  );
}

//

export type ResolveRelationSchema<
  TRelation extends AnyTruthRelation,
  TResolve extends boolean = false,
> = TRelation extends ZodNullable<TruthRelation<infer T>>
  ? TResolve extends true
    ? ZodNullable<Models[T]>
    : Models[T]
  : TRelation extends ZodArray<TruthRelation<infer T>>
    ? TResolve extends true
      ? ZodArray<Models[T]>
      : Models[T]
    : TRelation extends TruthRelation<infer T>
      ? Models[T]
      : never;

export function resolveRelationSchema<
  TRelation extends AnyTruthRelation,
  TResolve extends boolean,
>(
  relation: TRelation,
  resolve?: TResolve,
): ResolveRelationSchema<TRelation, TResolve> {
  function getModel(name: keyof Models) {
    const schema = Models[name];
    if (!schema) throw new Error(`Model "${name}" not found`);
    return schema;
  }

  if (relation instanceof ZodNullable) {
    const schema = getModel(relation._def.innerType._def.modelName);
    return (resolve ? schema.nullable() : schema) as never;
  } else if (relation instanceof ZodArray) {
    const schema = getModel(relation._def.type._def.modelName);
    return (resolve ? schema.array() : schema) as never;
  } else return getModel(relation._def.modelName) as never;
}

export type WrapRelationSchema<
  TRelation extends AnyTruthRelation,
  // @ts-ignore
  TSchema extends ZodTypeAny = ResolveRelationSchema<TRelation>,
> = TRelation extends ZodNullable<infer _>
  ? ZodNullable<TSchema>
  : TRelation extends ZodArray<infer _>
    ? ZodArray<TSchema>
    : TSchema;

export function wrapRelationSchema<
  TRelation extends AnyTruthRelation,
  TSchema extends ZodTypeAny,
>(
  relation: TRelation,
  // @ts-ignore
  schema: TSchema = resolveRelationSchema(relation),
): WrapRelationSchema<TRelation, TSchema> {
  if (relation instanceof ZodNullable) return schema.nullable() as never;
  if (relation instanceof ZodArray) return schema.array() as never;
  return schema as never;
}
