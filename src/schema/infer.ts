import type { ZodTypeAny, TypeOf as ZodTypeOf } from 'zod';
import type {
  ModelContext,
  ModelRawShape,
  RelationKeys,
  TruthModel,
} from './model';
import type { TruthMany, TruthOne } from './relation';

const Type = Symbol.for('_t.type');

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Any = any;

type Simplify<T> = { [K in keyof T]: T[K] } & {};

export type Infer<T extends ZodTypeAny> = Simplify<
  { [Type]?: T['_def']['truthName'] } & ZodTypeOf<T>
>;

export type With<
  T extends { [Type]?: keyof ModelContext },
  TO extends {
    [K in _TKeys]: _TShape[K] extends TruthMany<infer TModelName>
      ? Infer<ModelContext[TModelName]>[]
      : _TShape[K] extends TruthOne<infer TModelName>
        ? Infer<ModelContext[TModelName]>
        : never;
  },
  _TModel extends TruthModel<Any, Any> = //
  ModelContext[Extract<T[typeof Type], keyof ModelContext>],
  _TShape extends ModelRawShape = ReturnType<_TModel['_def']['fullShape']>,
  _TKeys extends string = RelationKeys<_TShape>,
> = Simplify<T & TO>;
