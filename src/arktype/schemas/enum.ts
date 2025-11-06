import { type Type, type } from 'arktype';
import type { Standard } from '~/standard.js';
import { parseEnum } from '../resolvers/enum.js';

////////////////////////////////////////////////////////////////////////////////

type Schema<values extends string[]> = Type<values[number]>;

type Truth<values extends readonly string[]> = {
  kind: 'enum';
  name: string | null;
  values: values;
};

////////////////////////////////////////////////////////////////////////////////

export type Enum<values extends `${Uppercase<string>}${string}`[]> =
  Schema<values> & {
    truth: Truth<values>;
    toTruth(): Standard.Enum;
  } & { [I in values[number]]: I };

export function enum_<const values extends `${Uppercase<string>}${string}`[]>(
  values: values,
): Enum<values> {
  const obj = Object.fromEntries(values.map((v) => [v, v])) as {
    [I in values[number]]: I;
  };
  const instantiate = type
    .valueOf(obj)
    // Force create a unique reference, avoids sharing references between enums
    // @ts-ignore
    .configure({ 't.key': Math.random() }) as Schema<values>;

  const out = Object.assign(instantiate, {
    truth: {
      kind: 'enum',
      name: null,
      values,
    } satisfies Truth<values>,
    toTruth(this: Enum<values>) {
      return parseEnum(this.truth.name!, this);
    },
    ...obj,
  }) as unknown as Enum<values>;

  // @ts-ignore
  for (const branch of instantiate.branches)
    Reflect.set(branch, 'truth', {
      kind: 'enum',
      get name() {
        return out.truth.name;
      },
    });

  return out;
}

export namespace enum_ {
  export function is(thing: unknown): thing is Enum<any> {
    if (!(typeof thing === 'function')) return false;
    const truth = Reflect.get(thing, 'truth');
    return truth?.kind === 'enum';
  }
}

export { enum_ as enum };
