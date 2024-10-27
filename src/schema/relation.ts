import { OK, ZodType, type ZodTypeDef } from 'zod';
import type { ModelContext } from './model';

export interface TruthRelationDef<TRelationKind extends 'one' | 'many'>
  extends ZodTypeDef {
  modelName: keyof ModelContext;
  relationKind: TRelationKind;
  fieldName: TRelationKind extends 'one' ? [string, ...string[]] : undefined;
  relatedFieldName: TRelationKind extends 'one'
    ? [string, ...string[]]
    : undefined;
}

export class TruthRelation<
  TRelationKind extends 'one' | 'many',
  TModelName extends keyof ModelContext,
> extends ZodType<
  `t.${TRelationKind}.${TModelName}`,
  TruthRelationDef<TRelationKind>
> {
  override _parse() {
    return OK(`t.${this._def.relationKind}.${this._def.modelName}` as never);
  }

  static create<
    TModelName extends keyof ModelContext,
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
export class TruthOne<
  TModelName extends keyof ModelContext,
> extends TruthRelation<'one', TModelName> {
  protected _ = 0;

  public static override create<TModelName extends keyof ModelContext>(
    modelName: TModelName,
    fieldName: [string, ...string[]],
    relatedFieldName: [string, ...string[]],
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
export class TruthMany<
  TModelName extends keyof ModelContext,
> extends TruthRelation<'many', TModelName> {
  protected _ = 0;

  public static override create<TModelName extends keyof ModelContext>(
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
