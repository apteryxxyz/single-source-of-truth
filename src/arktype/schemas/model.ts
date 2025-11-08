import { type Type, type } from 'arktype';
import type { Standard } from '~/standard.js';
import { parseModel } from '../resolvers/model.js';
import { type Relation, relation } from './relation.js';

////////////////////////////////////////////////////////////////////////////////

type scalarFields<shape extends object> = {
  [key in keyof shape as shape[key] extends Type
    ? key
    : shape[key] extends string
      ? key
      : never]: shape[key];
};

function scalarFields<shape extends object>(shape: shape) {
  const result = {} as scalarFields<shape>;
  for (const [key, value] of Object.entries(shape))
    if (typeof value === 'function' && 'precompilation' in value)
      Reflect.set(result, key, value);
  return result;
}

////////////////////////////////////////////////////////////////////////////////

type relationFields<shape extends object> = {
  [key in keyof shape as shape[key] extends () => Relation<any>
    ? key
    : // @ts-ignore
      never]: ReturnType<shape[key]>;
};

function relationFields<shape extends object>(shape: shape) {
  const result = {} as relationFields<shape>;
  for (const [key, value] of Object.entries(shape))
    if (typeof value === 'function' && value.length === 0)
      try {
        const maybe = value();
        if (relation.is(maybe)) Reflect.set(result, key, maybe);
      } catch {}
  return result;
}

////////////////////////////////////////////////////////////////////////////////

type unwrapModel<model extends Type> = model extends Model<infer shape, infer _>
  ? Model<shape>
  : never;

export function unwrapModel<model extends Type>(
  model: model,
): unwrapModel<model> {
  // @ts-ignore
  if (Array.isArray(model.json) && model.json[1]?.unit === null)
    // @ts-ignore
    return model.branches[0];
  // @ts-ignore
  if (model.json?.proto === 'Array') return model.structure.sequence.variadic;
  return model as any;
}

////////////////////////////////////////////////////////////////////////////////

type wrapModel<
  transformed extends Type,
  original extends Type,
> = transformed extends {
  infer: infer Inferred;
}
  ? original extends Model<any, infer A>
    ? A extends 'Array'
      ? Type<Inferred[]>
      : A extends 'null'
        ? Type<Inferred | null>
        : Type<Inferred>
    : never
  : never;

function wrapModel<transformed extends Type, original extends Type>(
  transformed: transformed,
  original: original,
): wrapModel<transformed, original> {
  // @ts-ignore
  if (Array.isArray(original.json) && original.json[1]?.unit === null)
    return transformed.or('null') as any;
  // @ts-ignore
  if (original?.json?.proto === 'Array') return transformed.array() as any;
  return transformed as any;
}

////////////////////////////////////////////////////////////////////////////////

type Schema<
  shape extends object,
  mode extends 'Array' | 'null' | undefined = undefined,
> = {
  array(): Model<shape, 'Array'>;
  or(def: 'null'): Model<shape, 'null'>;
} & type.instantiate<
  mode extends 'Array'
    ? scalarFields<shape>[]
    : mode extends 'null'
      ? scalarFields<shape> | null
      : scalarFields<shape>
>;

type Attributes<shape extends object> = ('id' extends keyof shape
  ? { id?: keyof shape | (keyof shape)[] }
  : { id: keyof shape | (keyof shape)[] }) & {
  unique?: (keyof shape | (keyof shape)[])[];
  updatedAt: (keyof shape)[];
};

type Truth<shape extends object> = {
  kind: 'model';
  name: string | null;
  shape: shape;
  attributes: Attributes<shape>;
  relations: relationFields<shape>;
  includes: (keyof relationFields<shape>)[];
};

////////////////////////////////////////////////////////////////////////////////

export type Model<
  shape extends object,
  mode extends 'Array' | 'null' | undefined = undefined,
> = Schema<shape, mode> & {
  truth: Truth<shape>;
  include: <
    key extends keyof relationFields<shape>,
    // @ts-ignore
    relatedModel extends Type = ReturnType<relationFields<shape>[key]>,
    transformedModel extends Type = unwrapModel<relatedModel>,
  >(
    key: key,
    transform?: (model: unwrapModel<relatedModel>) => transformedModel,
  ) => Model<
    Omit<shape, key> & Record<key, wrapModel<transformedModel, relatedModel>>
  >;
  toTruth(): Standard.Model;
};

export function model<const shape extends object>(
  shape: type.validate<shape>,
  attributes: Attributes<shape>,
): Model<shape> {
  const instantiate = type
    .raw(scalarFields(shape as shape))
    // Force create a unique reference, avoids sharing references between models
    // @ts-ignore
    .configure({ 't.key': Math.random() }) as Schema<shape>;

  return Object.assign(instantiate, {
    truth: {
      kind: 'model',
      name: null,
      shape: shape as shape,
      attributes,
      relations: relationFields(shape as shape),
      includes: [],
    } satisfies Truth<shape>,

    include(this: Model<shape>, key: string, transform?: Function) {
      const relatedModel = unwrapModel(
        (Reflect.get(this.truth.relations, key) as any)(),
      );
      const transformedModel = transform
        ? transform(relatedModel)
        : relatedModel;

      const newShape = {
        ...this.truth.shape,
        [key]: wrapModel(transformedModel, relatedModel),
      };
      const newModel = model(newShape as any, this.truth.attributes);
      newModel.truth.includes.push(key as never);

      return newModel;
    },
    toTruth(this: Model<shape>) {
      return parseModel(this.truth.name!, this);
    },
  }) as unknown as Model<shape>;
}

export namespace model {
  export function is(thing: unknown): thing is Model<any> {
    if (!(typeof thing === 'function')) return false;
    const truth = Reflect.get(thing, 'truth');
    return truth?.kind === 'model';
  }
}
