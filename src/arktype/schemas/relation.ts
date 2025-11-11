import type { Model, Shape } from './model.js';

type ModelLike = Model | { __shape: Shape };

export type Relation<getter extends () => ModelLike = any> = getter & {
  truth: {
    kind: 'relation';
    name?: string;
    references?: [string, string][];
  };
  name(this: Relation<getter>, name: string): Relation<getter>;
  reference(
    this: Relation<getter>,
    ownKey: string,
    foreignKey: string,
  ): Relation<getter>;
};

export function relation<getter extends () => ModelLike>(
  getter: getter,
): Relation<getter> {
  const out = Object.assign(getter, {
    truth: { kind: 'relation' as const },
    reference(this: Relation<getter>, ownKey: string, foreignKey: string) {
      this.truth.references ??= [];
      this.truth.references.push([ownKey, foreignKey]);
      return this;
    },
  }) as any;

  // Cannot redefine property name on a function, use a proxy to bypass
  return new Proxy(out, {
    get(target, key, receiver) {
      if (key === 'name') {
        function name(this: Relation<getter>, name: string) {
          this.truth.name = name;
          return this;
        }
        return name.bind(out);
      } else {
        return Reflect.get(target, key, receiver);
      }
    },
  }) as any;
}

export namespace relation {
  export function is(thing: any): thing is Relation {
    if (typeof thing !== 'function') return false;
    const truth = Reflect.get(thing, 'truth');
    return truth?.kind === 'relation';
  }
}
