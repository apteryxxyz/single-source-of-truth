import type { TypeOf as ZodTypeOf } from 'zod';
import type { TruthEnum } from './enum';
import type {
  ModelContext,
  ModelRawShape,
  RelationKeys,
  TruthModel,
} from './model';
import type { TruthMany, TruthOne } from './relation';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Any = any;

export type Infer<T> = //
  T extends TruthModel<infer TName, Any>
    ? { __name?: TName } & ZodTypeOf<T>
    : T extends TruthEnum<Any, Any>
      ? ZodTypeOf<T>
      : never;

export type With<
  T extends { __name?: keyof ModelContext },
  TO extends {
    [K in _TKeys]: _TShape[K] extends TruthMany<infer TModelName>
      ? Infer<ModelContext[TModelName]>[]
      : _TShape[K] extends TruthOne<infer TModelName>
        ? Infer<ModelContext[TModelName]>
        : never;
  },
  _TModel extends TruthModel<Any, Any> = //
  ModelContext[Extract<T['__name'], keyof ModelContext>],
  _TShape extends ModelRawShape = ReturnType<_TModel['_def']['fullShape']>,
  _TKeys extends string = RelationKeys<_TShape>,
> = T & TO;
