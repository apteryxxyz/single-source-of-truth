import { type as ark } from 'arktype';

type Schema<type extends string> = ark.instantiate<type>;

export type Field<type extends string = any> = Schema<type> & {
  truth: {
    kind: 'field';
    name: string | null;
    id?: true;
    unique?: true;
    updatedAt?: true;
  };
  // "id" is already used by arktype, append _ to avoid conflict
  id_(this: Field<type>): Field<type>;
  unique(this: Field<type>): Field<type>;
  updatedAt(this: Field<type>): Field<type>;
};

export function field<const type extends string>(
  type: ark.validate<type>,
): Field<type> {
  const parse = ark
    .raw(type)
    // Force create a unique reference, avoids sharing references between fields
    .configure({ ' key': Math.random() } as any) as Schema<type>;

  return Object.assign(parse, {
    truth: {
      kind: 'field' as const,
      name: null,
    },
    id_(this: Field<type>) {
      this.truth.id = true;
      return this;
    },
    unique(this: Field<type>) {
      this.truth.unique = true;
      return this;
    },
    updatedAt(this: Field<type>) {
      this.truth.updatedAt = true;
      return this;
    },
  });
}

export namespace field {
  export function is(thing: any): thing is Field {
    if (typeof thing !== 'function') return false;
    const truth = Reflect.get(thing, 'truth');
    return truth?.kind === 'field';
  }
}
