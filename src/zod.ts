import { z } from 'zod';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function wrap<T, A extends any[], B extends any[], R>(
  target: (this: T, ...args: [...A, ...B]) => R,
  ...boundArgs: A
) {
  return function (this: T, ...args: B) {
    return target.call(this, ...boundArgs, ...args);
  };
}

// ===== Model ===== //

declare module 'zod' {
  interface ZodObject<T extends z.ZodRawShape> {
    __model__: Partial<{
      map?: string;
      id?: Extract<keyof T, string>[];
      index?: Extract<keyof T, string>[];
    }>;
    $$id(fields: Extract<keyof T, string>[]): this;
    $$index(fields: Extract<keyof T, string>[]): this;
    $$map(map: string): this;
  }
}

const Models = [z.ZodObject];
for (const Model of Models) {
  function m(this: typeof Model.prototype, key: string, value: unknown) {
    if (!this.__model__) this.__model__ = {};
    Reflect.set(this.__model__, key, value);
    return this;
  }

  Object.defineProperties(Model.prototype, {
    $$id: { value: wrap(m, 'id') },
    $$index: { value: wrap(m, 'index') },
    $$map: { value: wrap(m, 'map') },
  });
}

// ===== Field ===== //

declare module 'zod' {
  interface ZodType {
    __field__: Partial<{
      map: string;
      id: boolean;
      unique: boolean;
      updatedAt: boolean;
      relation: [string[], string[]];
    }>;
    $id(): this;
    $map(map: string): this;
    $unique(): this;
    $updatedAt(): this;
    $relation(_: [fields: string[], references: string[]]): this;
  }
}

const Fields = [z.ZodType];
for (const Field of Fields) {
  function f(this: typeof Field.prototype, key: string, value: unknown) {
    if (!this.__field__) this.__field__ = {};
    Reflect.set(this.__field__, key, value);
    return this;
  }

  Object.defineProperties(Field.prototype, {
    $id: { value: wrap(f, 'id', true) },
    $map: { value: wrap(f, 'map') },
    $unique: { value: wrap(f, 'unique', true) },
    $updatedAt: { value: wrap(f, 'updatedAt', true) },
    $relation: { value: wrap(f, 'relation') },
  });
}

// ===== Enum ===== //

declare module 'zod' {
  interface ZodEnum<T extends [string, ...string[]]> {
    __enum__: Partial<{ map: string }>;
    $$map(map: string): this;
  }
}

const Enums = [z.ZodEnum];
for (const Enum of Enums) {
  function e(this: typeof Enum.prototype, key: string, value: unknown) {
    if (!this.__enum__) this.__enum__ = {};
    Reflect.set(this.__enum__, key, value);
    return this;
  }

  Object.defineProperties(Enum.prototype, {
    $$map: { value: wrap(e, 'map') },
  });
}

// ===== Value ===== //

declare global {
  interface String {
    __value__: Partial<{ map: string }>;
    $map<T>(this: T, map: string): T;
  }
}

const Values = [String];
for (const Value of Values) {
  function v(this: string, key: string, value: unknown) {
    Reflect.set(this.__value__, key, value);
    return this;
  }

  const map = new Map();
  Object.defineProperties(Value.prototype, {
    __value__: {
      get() {
        if (!map.has(this)) map.set(this, {});
        return map.get(this);
      },
    },
    $map: { value: wrap(v, 'map') },
  });
}
