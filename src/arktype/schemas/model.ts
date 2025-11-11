import { type as ark } from 'arktype';
import type { ArrayType } from 'arktype/internal/variants/array.ts';
import type { Standard } from '~/standard.js';
import { modelToStandard } from '../resolvers/model.js';
import type { Enum } from './enum.js';
import { type Field, field } from './field.js';
import type { Relation } from './relation.js';

export type Shape = Record<string, Field | Enum | (() => Relation)>;

type Schema<shape extends Shape> = {
  array(): ArrayType<ark.infer<Pick<shape, fieldKeys<shape>>>[]> & {
    readonly __shape: shape;
  };
  or(def: 'null'): ark.instantiate<Pick<shape, fieldKeys<shape>> | 'null'> & {
    readonly __shape: shape;
  };
} & ark.instantiate<Pick<shape, fieldKeys<shape>>>;

export type Model<shape extends Shape = any> = Schema<shape> & {
  truth: {
    kind: 'model';
    name: string | null;
    shape: shape;
    id: (keyof shape)[];
    unique?: (keyof shape)[][];
  };
  // "id" is already used by arktype, append _ to avoid conflict
  id_(this: Model<shape>, fields: (keyof shape)[]): Model<shape>;
  unique(this: Model<shape>, fields: (keyof shape)[]): Model<shape>;
  toTruth(this: Model): Standard.Model;
};

export function model<shape extends Shape>(
  shape: ark.validate<shape>,
): Model<shape> {
  const fields = Object.fromEntries(
    fieldKeys(shape).map((k) => [k, shape[k]]),
  ) as unknown as Pick<shape, fieldKeys<shape>>;

  const parse = ark
    .raw(fields)
    // Force create a unique reference, avoids sharing references between models
    .configure({ ' key': Math.random() } as any) as Schema<shape>;

  return Object.assign(parse, {
    truth: {
      kind: 'model' as const,
      name: null,
      shape: shape as shape,
    },
    id_(this: Model<shape>, fields: (keyof shape)[]) {
      this.truth.id = fields;
      return this;
    },
    unique(this: Model<shape>, fields: (keyof shape)[]) {
      this.truth.unique ??= [];
      this.truth.unique.push(fields);
      return this;
    },
    toTruth(this: Model) {
      return modelToStandard(this.truth.name ?? this.toString(), this);
    },
  }) as any;
}

export namespace model {
  export function is(thing: any): thing is Model {
    if (typeof thing !== 'function') return false;
    const truth = Reflect.get(thing, 'truth');
    return truth?.kind === 'model';
  }
}

//

type fieldKeys<shape> = keyof {
  [key in keyof shape as shape[key] extends Field ? key : never]: true;
};
function fieldKeys<shape extends Shape>(
  shape: shape,
): Extract<keyof shape, string>[] {
  return Object.keys(shape).filter((k) => field.is(shape[k])) as any;
}
