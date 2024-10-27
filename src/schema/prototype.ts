import { ZodBoolean, ZodDate, ZodNumber, ZodString } from 'zod';
import {
  IdSymbol,
  IndexSymbol,
  UniqueSymbol,
  UpdatedAtSymbol,
} from './symbols';

declare module 'zod' {
  interface ZodStringDef {
    [IdSymbol]?: boolean;
    [UniqueSymbol]?: boolean;
    [IndexSymbol]?: boolean;
  }
  interface ZodString {
    [IdSymbol](): ZodString;
    [UniqueSymbol](): ZodString;
    [IndexSymbol](): boolean;
  }

  interface ZodNumberDef {
    [IdSymbol]?: boolean;
    [UniqueSymbol]?: boolean;
    [IndexSymbol]?: boolean;
  }
  interface ZodNumber {
    [IdSymbol](): ZodNumber;
    [UniqueSymbol](): ZodNumber;
    [IndexSymbol](): boolean;
  }

  interface ZodBooleanDef {
    [IndexSymbol]?: boolean;
  }
  interface ZodBoolean {
    [IndexSymbol](): boolean;
  }

  interface ZodDateDef {
    [UpdatedAtSymbol]?: boolean;
  }
  interface ZodDate {
    [UpdatedAtSymbol](): ZodDate;
  }
}

Reflect.set(ZodString.prototype, IdSymbol, function (this: ZodString) {
  return new ZodString({
    ...this._def,
    [IdSymbol]: true,
  });
});

Reflect.set(ZodString.prototype, UniqueSymbol, function (this: ZodString) {
  return new ZodString({
    ...this._def,
    [UniqueSymbol]: true,
  });
});

Reflect.set(ZodString.prototype, IndexSymbol, function (this: ZodString) {
  return new ZodString({
    ...this._def,
    [IndexSymbol]: true,
  });
});

Reflect.set(ZodNumber.prototype, IdSymbol, function (this: ZodNumber) {
  return new ZodNumber({
    ...this._def,
    [IdSymbol]: true,
  });
});

Reflect.set(ZodNumber.prototype, UniqueSymbol, function (this: ZodNumber) {
  return new ZodNumber({
    ...this._def,
    [UniqueSymbol]: true,
  });
});

Reflect.set(ZodNumber.prototype, IndexSymbol, function (this: ZodNumber) {
  return new ZodNumber({
    ...this._def,
    [IndexSymbol]: true,
  });
});

Reflect.set(ZodBoolean.prototype, IndexSymbol, function (this: ZodBoolean) {
  return new ZodBoolean({
    ...this._def,
    [IndexSymbol]: true,
  });
});

Reflect.set(ZodDate.prototype, UpdatedAtSymbol, function (this: ZodDate) {
  return new ZodDate({
    ...this._def,
    [UpdatedAtSymbol]: true,
  });
});
