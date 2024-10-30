import './schema/prototype';

import { TruthEnum } from './schema/enum';
import { TruthModel } from './schema/model';
export const model = TruthModel.create;
export const ēnum = TruthEnum.create;

import { TruthMany, TruthOne } from './schema/relation';
export const one = TruthOne.create;
export const many = TruthMany.create;

export {
  Id as id,
  Index as index,
  Unique as unique,
  UpdatedAt as updatedAt,
} from './schema/symbols';
