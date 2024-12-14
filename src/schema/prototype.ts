import { ZodDate, ZodNumber, ZodString, type ZodTypeAny } from 'zod';
import { Id, Unique, UpdatedAt } from './symbols';

// ===== Id ===== //

declare module 'zod' {
  interface ZodStringDef {
    [Id]?: boolean;
  }
  interface ZodString {
    [Id](): ZodString;
  }
  interface ZodNumberDef {
    [Id]?: boolean;
  }
  interface ZodNumber {
    [Id](): ZodNumber;
  }
}

for (const Z of [ZodString, ZodNumber]) {
  function setId(this: ZodTypeAny) {
    return new Z({ ...this._def, [Id]: true });
  }
  Reflect.set(Z.prototype, Id, setId);
}

// ===== Unique ===== //

declare module 'zod' {
  interface ZodStringDef {
    [Unique]?: boolean;
  }
  interface ZodString {
    [Unique](): ZodString;
  }
  interface ZodNumberDef {
    [Unique]?: boolean;
  }
  interface ZodNumber {
    [Unique](): ZodNumber;
  }
}

for (const Z of [ZodString, ZodNumber]) {
  function setUnique(this: ZodTypeAny) {
    return new Z({ ...this._def, [Unique]: true });
  }
  Reflect.set(Z.prototype, Unique, setUnique);
}

// ===== UpdatedAt ===== //

declare module 'zod' {
  interface ZodDateDef {
    [UpdatedAt]?: boolean;
  }
  interface ZodDate {
    [UpdatedAt](): ZodDate;
  }
}

for (const Z of [ZodDate]) {
  function setUpdatedAt(this: ZodTypeAny) {
    return new Z({ ...this._def, [UpdatedAt]: true });
  }
  Reflect.set(Z.prototype, UpdatedAt, setUpdatedAt);
}
