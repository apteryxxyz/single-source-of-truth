import Cursor from 'code-block-writer';
import type { Standard } from '~/standard.js';

export function buildFieldLine(field: Standard.Model.Field) {
  const cursor = new Cursor({});

  cursor.write(field.name).space();
  cursor.write(resolvePrismaType(field));

  if (field.attributes.list) cursor.write('[]');
  if (field.attributes.nullable) cursor.write('?');

  if (field.attributes.id) cursor.space().write('@id');
  if (field.attributes.unique) cursor.space().write('@unique');
  if (field.attributes.updatedAt) cursor.space().write('@updatedAt');
  const relation = buildFieldRelationAttribute(field.attributes);
  if (relation) cursor.space().write(relation);

  return cursor.toString();
}

function resolvePrismaType(field: Standard.Model.Field) {
  switch (field.type) {
    case 'string':
      return 'String';
    case 'integer':
      return 'Int';
    case 'float':
      return 'Float';
    case 'boolean':
      return 'Boolean';
    case 'date':
      return 'DateTime';
    case 'bigint':
      return 'BigInt';
    case 'object':
      return 'Json';
    default:
      return field.type;
  }
}

function buildFieldRelationAttribute(
  attributes: NonNullable<Standard.Model.Field.Attributes>,
) {
  const parts = [];

  if (attributes.name) parts.push(`name:"${attributes.name}"`);

  if (attributes.references) {
    const fields = attributes.references.map((r) => r[0]);
    parts.push(`fields:[${fields.join(',')}]`);
    const references = attributes.references.map((r) => r[1]);
    parts.push(`references:[${references.join(',')}]`);
  }

  if (parts.length === 0) return null;

  return `@relation(${parts.join(',')})`;
}
