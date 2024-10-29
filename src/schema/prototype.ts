import { ZodBoolean, ZodDate, ZodNumber, ZodString } from 'zod';
import { Id, Index, Unique, UpdatedAt } from './symbols';

declare module 'zod' {
  interface ZodStringDef {
    [Id]?: boolean;
    [Unique]?: boolean;
    [Index]?: boolean;
  }
  interface ZodString {
    [Id](): ZodString;
    [Unique](): ZodString;
    [Index](): boolean;
  }

  interface ZodNumberDef {
    [Id]?: boolean;
    [Unique]?: boolean;
    [Index]?: boolean;
  }
  interface ZodNumber {
    [Id](): ZodNumber;
    [Unique](): ZodNumber;
    [Index](): boolean;
  }

  interface ZodBooleanDef {
    [Index]?: boolean;
  }
  interface ZodBoolean {
    [Index](): boolean;
  }

  interface ZodDateDef {
    [UpdatedAt]?: boolean;
  }
  interface ZodDate {
    [UpdatedAt](): ZodDate;
  }
}

Reflect.set(ZodString.prototype, Id, function (this: ZodString) {
  return new ZodString({
    ...this._def,
    [Id]: true,
  });
});

Reflect.set(ZodString.prototype, Unique, function (this: ZodString) {
  return new ZodString({
    ...this._def,
    [Unique]: true,
  });
});

Reflect.set(ZodString.prototype, Index, function (this: ZodString) {
  return new ZodString({
    ...this._def,
    [Index]: true,
  });
});

Reflect.set(ZodNumber.prototype, Id, function (this: ZodNumber) {
  return new ZodNumber({
    ...this._def,
    [Id]: true,
  });
});

Reflect.set(ZodNumber.prototype, Unique, function (this: ZodNumber) {
  return new ZodNumber({
    ...this._def,
    [Unique]: true,
  });
});

Reflect.set(ZodNumber.prototype, Index, function (this: ZodNumber) {
  return new ZodNumber({
    ...this._def,
    [Index]: true,
  });
});

Reflect.set(ZodBoolean.prototype, Index, function (this: ZodBoolean) {
  return new ZodBoolean({
    ...this._def,
    [Index]: true,
  });
});

Reflect.set(ZodDate.prototype, UpdatedAt, function (this: ZodDate) {
  return new ZodDate({
    ...this._def,
    [UpdatedAt]: true,
  });
});
