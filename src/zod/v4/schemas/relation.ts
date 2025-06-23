import * as z from 'zod/v4';
import type { TruthModel } from './model.js';
import type { TruthShape } from './shape.js';

export interface TruthRelationDef<RelatedShape extends TruthShape = TruthShape>
  extends z.core.$ZodTypeDef {
  type: 'custom';
  name?: string;
  references?: [field: string, relatedField: string][];
  getter(): TruthModel<RelatedShape>;
}

export interface TruthRelationInternals<
  RelatedShape extends TruthShape = TruthShape,
> extends z.core.$ZodTypeInternals<TruthModel<RelatedShape>> {
  def: TruthRelationDef<RelatedShape>;
}

export interface TruthRelation<RelatedShape extends TruthShape = TruthShape>
  extends z.ZodType<TruthModel<RelatedShape>> {
  _zod: TruthRelationInternals<RelatedShape>;
  def: TruthRelationDef<RelatedShape>;

  unwrap(): TruthModel<RelatedShape>;
  name(name: string): this;
  reference(field: string, relatedField: keyof RelatedShape): this;
}

export const TruthRelation: z.core.$constructor<TruthRelation> =
  z.core.$constructor('TruthRelation', (inst, def) => {
    z.ZodType.init(inst, def);

    inst.unwrap = () => def.getter();
    inst.name = (name) => inst.clone({ ...inst.def, ' name': name });
    inst.reference = (field, relatedField) =>
      inst.clone({
        ...inst.def,
        ' references': [...(inst.def.references ?? []), [field, relatedField]],
      });
  });

export function relation<RelatedShape extends TruthShape>(
  getter: () => TruthModel<RelatedShape>,
): TruthRelation<RelatedShape> {
  return new TruthRelation({
    type: 'custom',
    getter: getter as any,
  }) as any;
}

//

export namespace TruthRelationUtil {
  export type AnyRelation =
    | TruthRelation
    | z.ZodNullable<TruthRelation>
    | z.ZodArray<TruthRelation>;

  export type AnyRelationAny =
    | TruthRelation<any>
    | z.ZodNullable<TruthRelation<any>>
    | z.ZodArray<TruthRelation<any>>;

  export function isAnyRelation(value: unknown): value is AnyRelation {
    return (
      value instanceof TruthRelation ||
      (value instanceof z.ZodNullable &&
        value.unwrap() instanceof TruthRelation) ||
      (value instanceof z.ZodArray && value.element instanceof TruthRelation)
    );
  }

  export type NormaliseRelation<Relation extends AnyRelation> =
    Relation extends TruthRelation<infer Shape>
      ? TruthModel<Shape>
      : Relation extends z.ZodNullable<TruthRelation<infer Shape>>
        ? TruthModel<Shape>
        : Relation extends z.ZodArray<TruthRelation<infer Shape>>
          ? TruthModel<Shape>
          : never;

  export function normaliseRelation<Relation extends AnyRelation>(
    relation: Relation,
  ): NormaliseRelation<Relation> {
    if (relation instanceof TruthRelation) return relation.def.getter() as any;
    if (relation instanceof z.ZodNullable)
      return z.nullable(relation.unwrap().unwrap()) as any;
    if (relation instanceof z.ZodArray)
      return z.array(relation.element.unwrap()) as any;
    throw new Error('Invalid relation');
  }

  export type ExtractModelFromRelation<Relation extends AnyRelation> =
    Relation extends TruthRelation<infer Shape>
      ? TruthModel<Shape>
      : Relation extends z.ZodNullable<TruthRelation<infer Shape>>
        ? TruthModel<Shape>
        : Relation extends z.ZodArray<TruthRelation<infer Shape>>
          ? TruthModel<Shape>
          : never;

  export function extractModelFromRelation<Relation extends AnyRelation>(
    relation: Relation,
  ): ExtractModelFromRelation<Relation> {
    if (relation instanceof TruthRelation) return relation.def.getter() as any;
    if (relation instanceof z.ZodNullable)
      return relation.unwrap().unwrap() as any;
    if (relation instanceof z.ZodArray) return relation.element.unwrap() as any;
    throw new Error('Invalid relation');
  }

  export type ApplyRelationWrapping<
    Template extends AnyRelation,
    Schema extends z.ZodType = TruthModel<ExtractModelFromRelation<Template>>,
  > = Template extends z.ZodArray
    ? z.ZodArray<Schema>
    : Template extends z.ZodNullable
      ? z.ZodNullable<Schema>
      : Schema;

  export function applyRelationWrapping<
    Template extends AnyRelation,
    Schema extends z.ZodType = TruthModel<ExtractModelFromRelation<Template>>,
  >(
    blueprint: Template,
    schema: Schema,
  ): ApplyRelationWrapping<Template, Schema> {
    if (blueprint instanceof TruthRelation) return schema as any;
    if (blueprint instanceof z.ZodNullable) return z.nullable(schema) as any;
    if (blueprint instanceof z.ZodArray) return z.array(schema) as any;
    throw new Error('Invalid relation');
  }
}
