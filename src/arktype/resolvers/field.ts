import { type Type, type } from 'arktype';
import type { Standard } from '~/standard.js';
import { enum_ } from '../schemas/enum.js';
import { unwrapModel } from '../schemas/model.js';
import { relation } from '../schemas/relation.js';

export function parseField(name: string, field: Type): Standard.Model.Field {
  const [kind, type, attributes] = resolveField(field);
  return { name, kind, type, attributes } as Standard.Model.Field;
}

function resolveField(
  field: Type,
): [
  Standard.Model.Field.Kind,
  Standard.Model.Field.Type,
  Standard.Model.Field.Attributes,
] {
  if (Array.isArray(field.json)) {
    // @ts-ignore
    if (field.json.at(-1)?.unit === null) {
      // @ts-ignore
      const branches = field.branches.slice(0, -1);
      if (branches.length === 1) {
        const [kind, type, attributes] = resolveField(branches[0]);
        return [kind, type, { ...attributes, nullable: true }];
      } else if (branches.every((t: any) => t?.truth?.kind === 'enum')) {
        return ['enum', branches[0].truth.name!, {}];
      } else {
        const node = field.$.node('union', branches);
        // @ts-ignore
        const [kind, type, attributes] = resolveField(node);
        return [kind, type, { ...attributes, list: true }];
      }
    }
  }

  // @ts-ignore
  switch (field.json?.domain?.domain ?? field.json?.domain) {
    case 'string':
      return ['scalar', 'string', {}];
    case 'number':
      // @ts-ignore
      return ['scalar', field.json.divisor === 1 ? 'integer' : 'float', {}];
    case 'bigint':
      return ['scalar', 'bigint', {}];
    case 'object':
      return ['scalar', 'object', {}];
  }

  // @ts-ignore
  switch (field.json?.proto) {
    case 'Date':
      return ['scalar', 'date', {}];
    case 'Array': {
      const [kind, type, attributes] = //
        // @ts-ignore
        resolveField(field.structure.sequence.variadic);
      return [kind, type, { ...attributes, list: true }];
    }
  }

  if (field === type('boolean')) {
    return ['scalar', 'boolean', {}];
  } else if (enum_.is(field)) {
    return ['enum', field.truth.name!, {}];
  } else if (relation.is(field)) {
    const relative = field();
    const [, , attributes] = resolveField(relative);
    if (field.truth.references)
      attributes.references = field.truth.references as any;
    const model = unwrapModel(relative);
    return ['object', model.truth.name!, attributes];
  }

  throw new Error(`Unhandled field type: "${field}"`);
}
