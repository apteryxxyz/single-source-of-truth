export type Compute<T> = {
  [K in keyof T]: T[K] extends object ? Compute<T[K]> : T[K];
} & {};
