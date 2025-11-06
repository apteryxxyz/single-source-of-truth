import type { Model } from './model.js';

////////////////////////////////////////////////////////////////////////////////

type Truth<model extends Model<any>> = {
  kind: 'relation';
  references?: [string, keyof model['truth']['shape']][];
};

////////////////////////////////////////////////////////////////////////////////

export type Relation<model extends Model<any>> = (() => model) & {
  truth: Truth<model>;
};

export function relation<model extends Model<any>>(
  getter: () => model,
  references?: [string, keyof model['truth']['shape']][],
): Relation<model> {
  return Object.assign(() => getter(), {
    truth: {
      kind: 'relation',
      references,
    } satisfies Truth<model>,
  });
}

export namespace relation {
  export function is(thing: unknown): thing is Relation<any> {
    if (!(typeof thing === 'function')) return false;
    const truth = Reflect.get(thing, 'truth');
    return truth?.kind === 'relation';
  }
}
