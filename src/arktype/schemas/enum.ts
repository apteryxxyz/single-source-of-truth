import { type Type as Ark, type as ark } from 'arktype';
import type { Standard } from '~/standard.js';
import { enumToStandard } from '../resolvers/enum.js';

type Schema<values extends string[]> = Ark<values[number]>;

export type Enum<values extends string[] = any> = Schema<values> & {
  truth: {
    kind: 'enum';
    name: string | null;
    values: values;
  };
  toTruth(this: Enum): Standard.Enum;
};

// "enum" is a reserved keyword, so we append _
export function enum_<const values extends `${Uppercase<string>}${string}`[]>(
  values: values,
): Enum<values> {
  const obj = Object.fromEntries(values.map((v) => [v, v])) as {
    [I in values[number]]: I;
  };

  const parse = ark
    .valueOf(obj)
    // Force create a unique reference, avoids sharing references between enums
    // @ts-ignore
    .configure({ ' key': Math.random() } as any) as Schema<values>;

  return Object.assign(parse, {
    truth: {
      kind: 'enum' as const,
      name: null,
      values,
    },
    toTruth(this: Enum) {
      return enumToStandard(this.truth.name ?? this.toString(), this);
    },
  });
}

export namespace enum_ {
  export function is(thing: any): thing is Enum {
    if (typeof thing !== 'function') return false;
    const truth = Reflect.get(thing, 'truth');
    return truth?.kind === 'enum';
  }
}

export { enum_ as enum };
