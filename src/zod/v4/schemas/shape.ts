import type * as z from 'zod/v4';
import { id, unique } from '../symbols.js';
import { TruthRelationUtil } from './relation.js';

export type ZodShape = z.core.$ZodLooseShape;

export interface AttributesShape {
  [id]?: string[];
  [unique]?: string[][];
}

export type TruthShape = AttributesShape & ZodShape;

//

export namespace TruthShapeUtil {
  export type IsAttributesKey<Key extends string> =
    Key extends keyof AttributesShape ? true : false;

  export function isAttributesKey<Key extends string>(
    key: Key,
  ): key is keyof AttributesShape & Key {
    return key === id || key === unique;
  }

  export type ExtractAttributesShape<Shape extends TruthShape> = {
    [Key in keyof Shape as Key extends keyof AttributesShape
      ? Key
      : never]: Shape[Key];
  };

  export function extractAttributesShape<Shape extends TruthShape>(
    shape: Shape,
  ) {
    return Object.entries(shape).reduce(
      (shape, [k, v]) => {
        if (!isAttributesKey(k)) return shape;
        Reflect.set(shape, k, v);
        return shape;
      },
      {} as ExtractAttributesShape<Shape>,
    );
  }

  export type NormaliseAttributesShape<Shape extends AttributesShape> = {
    [Key in keyof Shape as Key extends ` ${infer K}` ? K : Key]: Shape[Key];
  };

  export function normaliseAttributesShape<Shape extends AttributesShape>(
    shape: Shape,
  ): NormaliseAttributesShape<Shape> {
    return Object.entries(shape).reduce(
      (shape, [k, v]) => {
        Reflect.set(shape, k.trimStart(), v);
        return shape;
      },
      {} as NormaliseAttributesShape<Shape>,
    );
  }

  export type ExtractRelationsShape<Shape extends TruthShape> = {
    [Key in keyof Shape as Shape[Key] extends TruthRelationUtil.AnyRelationAny
      ? Key
      : never]: Shape[Key];
  };

  export function extractRelationsShape<Shape extends TruthShape>(
    shape: Shape,
  ): ExtractRelationsShape<Shape> {
    return Object.entries(shape).reduce(
      (shape, [k, v]) => {
        if (!TruthRelationUtil.isAnyRelation(v)) return shape;
        Reflect.set(shape, k, v);
        return shape;
      },
      {} as ExtractRelationsShape<Shape>,
    );
  }

  export type ExtractZodShape<Shape extends TruthShape> = Omit<
    {
      [K in keyof Shape as Shape[K] extends z.ZodType ? K : never]: Shape[K];
    },
    keyof AttributesShape /* | keyof ExtractRelationsShape<Shape> */
  >;

  export function extractZodShape<Shape extends TruthShape>(shape: Shape) {
    return Object.entries(shape).reduce(
      (shape, [k, v]) => {
        if (isAttributesKey(k)) return shape;
        // if (TruthRelationUtil.isAnyRelation(v)) return shape;
        Reflect.set(shape, k, v);
        return shape;
      },
      {} as ExtractZodShape<Shape>,
    );
  }
}
