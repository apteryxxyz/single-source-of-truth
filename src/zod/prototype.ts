import { ZodType } from 'zod';
import type { Standard } from '~/standard.js';
import { id, unique, updatedAt } from './symbols.js';

declare module '@zod/core' {
  interface $ZodTypeDef
    extends Pick<
      Standard.Model.Field.Attributes,
      'id' | 'unique' | 'updatedAt' | 'references'
    > {}
}

declare module 'zod' {
  interface ZodString {
    [id](): this;
    [unique](): this;
  }
  interface ZodNumber {
    [id](): this;
    [unique](): this;
  }
  interface ZodDate {
    [updatedAt](): this;
  }
}
ZodType.prototype[id] = function (this: ZodType) {
  return this.clone({
    ...this.def,
    id: true,
  });
};
ZodType.prototype[unique] = function (this: ZodType) {
  return this.clone({
    ...this.def,
    unique: true,
  });
};
ZodType.prototype[updatedAt] = function (this: ZodType) {
  return this.clone({
    ...this.def,
    updatedAt: true,
  });
};
