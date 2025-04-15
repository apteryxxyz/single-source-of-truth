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
  if (field.attributes.references?.length) {
    const relation = buildFieldRelationAttribute(field.attributes.references);
    cursor.space().write(relation);
  }

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
  relation: NonNullable<Standard.Model.Field.Attributes['references']>,
) {
  const cursor = new Cursor();

  const fields = relation.map((r) => r[0]);
  const references = relation.map((r) => r[1]);

  cursor.write('@relation(');
  cursor.write(
    `fields: [${fields.join(',')}], references: [${references.join(',')}]`,
  );
  cursor.write(')');

  return cursor.toString();
}
