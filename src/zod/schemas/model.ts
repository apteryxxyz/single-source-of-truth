import * as z from 'zod';
import type { Standard } from '~/standard.js';
import { parseModelSchema } from '../resolvers/model.js';
import { TruthRelationUtil } from './relation.js';
import { type TruthShape, TruthShapeUtil } from './shape.js';

export interface TruthModelDef<Shape extends TruthShape = TruthShape>
  extends z.core.$ZodObjectDef<TruthShapeUtil.ExtractZodShape<Shape>> {
  name: string | null;
  attributes: TruthShapeUtil.NormaliseAttributesShape<
    TruthShapeUtil.ExtractAttributesShape<Shape>
  >;
  relations: TruthShapeUtil.ExtractRelationsShape<Shape>;
  includes: string[];
}

export interface TruthModelInternals<Shape extends TruthShape>
  extends z.core.$ZodObjectInternals<
    TruthShapeUtil.ExtractZodShape<Shape>,
    Record<never, never>
  > {
  def: TruthModelDef<Shape>;
}

export interface TruthModel<Shape extends TruthShape = TruthShape>
  extends z.ZodObject<
    TruthShapeUtil.ExtractZodShape<Shape>,
    Record<never, never>
  > {
  _zod: TruthModelInternals<Shape>;

  with<
    Include extends keyof TruthShapeUtil.ExtractRelationsShape<Shape>,
    Relation extends
      TruthRelationUtil.AnyRelationAny = TruthShapeUtil.ExtractRelationsShape<Shape>[Include],
    Model extends
      z.ZodType = // @ts-expect-error - i do what i want fr fr no cap
    TruthRelationUtil.ExtractModelFromRelation<Relation>,
    Schema extends z.ZodType = Model,
  >(
    include: Extract<Include, string>,
    override?: (model: Model) => Schema,
  ): TruthModel<
    Omit<Shape, Include> &
      Record<Include, TruthRelationUtil.ApplyRelationWrapping<Relation, Schema>>
  >;
  toStandard(): Standard.Model;
}

export const TruthModel: z.core.$constructor<TruthModel> = z.core.$constructor(
  'TruthModel',
  (inst, def) => {
    z.ZodObject.init(inst, def);

    inst.with = (include, override) => {
      const relation = inst._zod.def.relations[include];
      const model = TruthRelationUtil.extractModelFromRelation(relation);
      const schema = override ? override(model as any) : model;
      return inst.clone({
        ...inst._zod.def,
        includes: [...inst._zod.def.includes, include],
        shape: {
          ...inst._zod.def.shape,
          [include]: TruthRelationUtil.applyRelationWrapping(relation, schema),
        },
      }) as any;
    };
    inst.toStandard = () => parseModelSchema(def.name ?? '', inst);
  },
);

export function model<Shape extends TruthShape>(
  shape: Shape,
): TruthModel<Shape> {
  return new TruthModel({
    type: 'object',
    name: null,
    shape: TruthShapeUtil.extractZodShape(shape),
    includes: [],
    attributes: TruthShapeUtil.normaliseAttributesShape(
      TruthShapeUtil.extractAttributesShape(shape),
    ),
    relations: TruthShapeUtil.extractRelationsShape(shape),
    get optional() {
      return z.core.util.optionalObjectKeys(this.shape);
    },
  }) as any;
}
