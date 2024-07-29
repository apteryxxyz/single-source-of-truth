interface Attributes {
  [key: PropertyKey]: Attributes | unknown;
}

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
type UnionToIntersection<U> = Prettify<
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never
>;
function attributes<T extends {}, TAttributes extends Attributes[]>(
  target: T,
  ...attributes: TAttributes
): T {
  const _ = attributes.reduce(
    (a, c) => Object.assign(a, c),
    {},
  ) as UnionToIntersection<TAttributes[number]>;
  return Object.assign(target, { __attr__: _ });
}

function get<T>(
  target: T,
): (T extends { __attr__: infer U } ? U : object) & Attributes {
  return (
    target && typeof target === 'object' && '__attr__' in target
      ? target.__attr__
      : {}
  ) as never;
}

export default Object.assign(attributes, { get });
