// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Any = any;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
