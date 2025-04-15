import type { ZodType, infer as zInfer } from 'zod';
import type { Compute } from '~/zod/types.js';

type _infer<T extends ZodType> = Compute<zInfer<T>>;
export type { _infer as infer };
