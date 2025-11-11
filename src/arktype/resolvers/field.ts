// @ts-nocheck

import { type Type as Ark, type as ark } from 'arktype';
import type { Standard } from '~/standard.js';
import type { Field } from '../schemas/field.js';
import { relation } from '../schemas/relation.js';

export function fieldToStandard(
  name: string,
  field: Field,
): Standard.Model.Field {
  const [kind, type, attributes] = typeToStandard(field);
  if (field.truth.id) attributes.id = true;
  if (field.truth.unique) attributes.unique = true;
  if (field.truth.updatedAt) attributes.updatedAt = true;
  return { name, kind, type, attributes } as any;
}

export function typeToStandard(
  type: Ark,
): [
  Standard.Model.Field.Kind,
  Standard.Model.Field.Type,
  Standard.Model.Field.Attributes,
] {
  if (
    type.json &&
    'branches' in type.json &&
    Array.isArray(type.json.branches)
  ) {
    if (type.json.branches.some((b) => b.unit === null)) {
      const branches = type.branches.filter((b) => b.domain !== 'null');
      if (branches.length === 1) {
        const [k, t, a] = typeToStandard(branches[0]);
        return [k, t, { ...a, nullable: true }];
      } else {
        const union = ark
          .raw(type.$.node('union', branches).expression)
          .configure({ key: Math.random() } as any);
        const [k, t, a] = typeToStandard(union);
        return [k, t, { ...a, nullable: true }];
      }
    } else if (type.json.branches.every((b) => typeof b.unit === 'boolean')) {
      return ['scalar', 'boolean', {}];
    } else if (
      type.json.branches.every(
        (b, _, a) => b.domain?.domain === a[0].domain?.domain,
      )
    ) {
      const entry = type.branches[0];
      const [k, t, a] = typeToStandard(entry);
      return [k, t, a];
    }
  }

  switch (type.json?.domain?.domain ?? type.json?.domain) {
    case 'string':
      return ['scalar', 'string', {}];
    case 'number': {
      const rule = type.json?.divisor?.rule ?? type.json.divisor;
      return ['scalar', rule === 1 ? 'integer' : 'float', {}];
    }
    case 'bigint':
      return ['scalar', 'bigint', {}];
    case 'object':
      return ['scalar', 'object', {}];
  }

  switch (type.json?.proto?.proto ?? type.json?.proto) {
    case 'Date':
      return ['scalar', 'date', {}];
    case 'Array': {
      const [k, t, a] = typeToStandard(type.structure.sequence.variadic);
      return [k, t, { ...a, list: true }];
    }
  }

  if (relation.is(type)) {
    const relative = type();
    let model: Ark;
    const attributes: Standard.Model.Field.Attributes = {};

    if (relative.json?.proto === 'Array') {
      model = relative.structure.sequence.variadic;
      attributes.list = true;
    } else if (relative.json?.at?.(1)?.unit === null) {
      model = relative.branches[0];
      attributes.nullable = true;
    } else {
      model = relative;
    }

    if (type.truth.name) attributes.name = type.truth.name;
    if (type.truth.references) attributes.references = type.truth.references;

    return ['object', model.truth.name, attributes];
  }

  throw new Error(`Unable to resolve type: "${type}"`);
}
