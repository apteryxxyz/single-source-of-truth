export type Value = string & {
  attributes: Partial<{ map: string }>;
};

export function parseValue(schema: string): Value {
  const attributes: Value['attributes'] = {};
  const options: Exclude<(typeof String)['prototype']['__value__'], undefined> =
    {};

  const current = schema;
  if (current.__value__)
    for (const k of Object.keys(current.__value__))
      Reflect.set(options, k, Reflect.get(current.__value__, k));

  if (options.map) attributes.map = options.map;

  return Object.assign(current, { attributes });
}
