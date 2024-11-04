import { OK, ZodType, type ZodTypeDef } from 'zod';
import type { Models } from './model';

export interface TruthRelationDef<TRelationKind extends 'one' | 'many'>
  extends ZodTypeDef {
  modelName: keyof Models;
  relationKind: TRelationKind;
  fieldName: TRelationKind extends 'one' ? [string, ...string[]] : undefined;
  relatedFieldName: TRelationKind extends 'one'
    ? [string, ...string[]]
    : undefined;
}

export class TruthRelation<
  TRelationKind extends 'one' | 'many',
  TModelName extends keyof Models,
> extends ZodType<
  `t.${TRelationKind}.${TModelName}`,
  TruthRelationDef<TRelationKind>
> {
  override _parse() {
    return OK(`t.${this._def.relationKind}.${this._def.modelName}` as never);
  }

  static create<
    TModelName extends keyof Models,
    TRelationKind extends 'one' | 'many',
  >(
    modelName: TModelName,
    relationKind: TRelationKind,
    ...args: TRelationKind extends 'one'
      ? [fieldName: string, relatedFieldName: string]
      : []
  ) {
    return new TruthRelation<TRelationKind, TModelName>({
      modelName,
      relationKind,
      fieldName: args[0] as never,
      relatedFieldName: args[1] as never,
    });
  }
}

// @ts-ignore
export class TruthOne<TModelName extends keyof Models> extends TruthRelation<
  'one',
  TModelName
> {
  protected _ = 0;

  public static override create<
    TModelName extends keyof Models,
    TFieldLength extends number,
  >(
    modelName: TModelName,
    fieldName: [string, ...string[]] & { length: TFieldLength },
    relatedFieldName: [string, ...string[]] & { length: NoInfer<TFieldLength> },
  ) {
    return new TruthOne<TModelName>({
      modelName,
      relationKind: 'one',
      fieldName,
      relatedFieldName,
    });
  }
}

// @ts-ignore
export class TruthMany<TModelName extends keyof Models> extends TruthRelation<
  'many',
  TModelName
> {
  protected _ = 0;

  public static override create<TModelName extends keyof Models>(
    modelName: TModelName,
  ) {
    return new TruthMany<TModelName>({
      modelName,
      relationKind: 'many',
      fieldName: undefined,
      relatedFieldName: undefined,
    });
  }
}
