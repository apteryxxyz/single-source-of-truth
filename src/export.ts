import './schema/prototype';

export type { Infer as infer, With as with } from './schema/infer';

import { TruthEnum } from './schema/enum';
import { TruthModel } from './schema/model';
export const model = TruthModel.create;
export const ēnum = TruthEnum.create;

import { TruthMany, TruthOne } from './schema/relation';
export const one = TruthOne.create;
export const many = TruthMany.create;

import {
  IdSymbol,
  IndexSymbol,
  UniqueSymbol,
  UpdatedAtSymbol,
} from './schema/symbols';
export const id: typeof IdSymbol = IdSymbol;
export const unique: typeof UniqueSymbol = UniqueSymbol;
export const index: typeof IndexSymbol = IndexSymbol;
export const updatedAt: typeof UpdatedAtSymbol = UpdatedAtSymbol;
