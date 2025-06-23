import { ZodType } from 'zod/v4';
import type { Standard } from '~/standard.js';
import { id, unique, updatedAt } from './symbols.js';

declare module 'zod/v4/core' {
  interface $ZodTypeDef {
    ' id'?: Standard.Model.Field.Attributes['id'];
    ' unique'?: Standard.Model.Field.Attributes['unique'];
    ' updatedAt'?: Standard.Model.Field.Attributes['updatedAt'];
    ' name'?: Standard.Model.Field.Attributes['name'];
    ' references'?: Standard.Model.Field.Attributes['references'];
  }
}

declare module 'zod/v4' {
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
    ' id': true,
  });
};
ZodType.prototype[unique] = function (this: ZodType) {
  return this.clone({
    ...this.def,
    ' unique': true,
  });
};
ZodType.prototype[updatedAt] = function (this: ZodType) {
  return this.clone({
    ...this.def,
    ' updatedAt': true,
  });
};
