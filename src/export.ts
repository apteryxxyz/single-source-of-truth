import './schema/prototype';

export type { Infer as infer, With as with } from './schema/infer';

import { TruthEnum } from './schema/enum';
import { TruthModel } from './schema/model';
export const model = TruthModel.create;
export const ēnum = TruthEnum.create;

import { TruthMany, TruthOne } from './schema/relation';
export const one = TruthOne.create;
export const many = TruthMany.create;

import { Id, Index, Unique, UpdatedAt } from './schema/symbols';
export const id: typeof Id = Id as typeof Id;
export const unique: typeof Unique = Unique as typeof Unique;
export const index: typeof Index = Index as typeof Index;
export const updatedAt: typeof UpdatedAt = UpdatedAt as typeof UpdatedAt;
