import type { PrismaEnum } from '../parsers/enum';
import type { PrismaModel } from '../parsers/model';

export function buildPrismaSchema(models: PrismaModel[], enums: PrismaEnum[]) {
  let schema = '';

  // Enums
  for (const e of enums) {
    // Enum name
    schema += `enum ${e.name} {\n`;

    for (const v of e.values) {
      // Value name
      schema += `  ${v}\n`;
    }

    schema += '}\n\n';
  }

  const schemaSnapshot = schema;

  // Models
  for (const m of models) {
    // Model name
    schema += `model ${m.name} {\n`;

    // Model fields
    for (const f of m.fields) {
      // Field name and type
      schema += `  ${f.name} ${f.type}`;
      if (f.attributes.list) schema += '[]';
      if (f.attributes.nullable) schema += '?';

      // Field attributes
      if (f.attributes.id) schema += ' @id';
      if (f.attributes.unique) schema += ' @unique';
      if (f.attributes.updatedAt) schema += ' @updatedAt';

      if (f.attributes.relation) {
        schema += ` @relation(fields: [${f.attributes.relation.fields.join(',')}], references: [${f.attributes.relation.relatedFields.join(',')}]`;
        if (f.attributes.relation.map)
          schema += `, map: "${f.attributes.relation.map}"`;
        if (f.attributes.relation.onUpdate)
          schema += `, onUpdate: "${f.attributes.relation.onUpdate}"`;
        if (f.attributes.relation.onDelete)
          schema += `, onDelete: "${f.attributes.relation.onDelete}"`;
        schema += ')';
      }

      if (f.attributes.default) {
        const df = f.attributes.default;

        if (df.toString().includes('new Date')) {
          schema += ' @default(now())';
        } else {
          const dv = df();

          if (Array.isArray(dv)) schema += ` @default([${dv.join(', ')}])`;
          else if (schemaSnapshot.includes(`  ${dv}`))
            schema += ` @default(${dv})`;
          else if (typeof dv === 'string') schema += ` @default("${dv}")`;
          else if (typeof dv === 'number' || typeof dv === 'boolean')
            schema += ` @default(${dv})`;
          else throw new Error(`Unexpected default value: ${dv}`);
        }
      }

      schema += '\n';
    }

    // Model attributes
    if (m.attributes.id) {
      schema += `  @@id([${m.attributes.id.fields.join(',')}]`;
      if (m.attributes.id.name) schema += `, name: "${m.attributes.id.name}"`;
      if (m.attributes.id.map) schema += `, map: "${m.attributes.id.map}"`;
      schema += ')\n';
    }
    if (m.attributes.unique?.length) {
      for (const u of m.attributes.unique) {
        schema += `  @@unique([${u.fields.join(',')}]`;
        if (u.name) schema += `, name: "${u.name}"`;
        if (u.map) schema += `, map: "${u.map}"`;
        schema += ')\n';
      }
    }
    if (m.attributes.index?.length) {
      for (const i of m.attributes.index) {
        schema += `  @@index([${i.fields.join(',')}]`;
        if (i.name) schema += `, name: "${i.name}"`;
        if (i.map) schema += `, map: "${i.map}"`;
        schema += ')\n';
      }
    }
    if (m.attributes.map) schema += `  @@map("${m.attributes.map}")\n`;

    schema += '}\n\n';
  }

  return `// This file was automatically generated, any changes made here will be lost!\n\n${schema}`.trim();
}
