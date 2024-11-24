import type { TypeOf, ZodTypeAny } from 'zod';
import type { Prettify } from './types';

export { createEnum as enum } from './schema/enum';
export { createModel as model } from './schema/model';
export { createRelation as relation } from './schema/relation';

export type infer<T extends ZodTypeAny> = Prettify<TypeOf<T>>;
