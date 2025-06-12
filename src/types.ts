export type Path<Extension extends string = ''> = `${string}${Extension}`;
export type MaybeArray<T> = T | T[];
export type Compute<T> = {
  [K in keyof T]: T[K] extends object ? Compute<T[K]> : T[K];
} & {};
