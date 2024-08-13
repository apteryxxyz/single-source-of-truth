import type { Enum } from '../parsers/enum';
import type { Model } from '../parsers/model';

export function buildPrismaSchema(context: { models: Model[]; enums: Enum[] }) {
  let schema = '';

  for (const e of context.enums) {
    // Enum name
    schema += `enum ${e.name} {\n`;

    for (const v of e.values) {
      // Field name
      schema += `  ${v}`;

      // Field attributes
      if (v.attributes.map) schema += ` @map("${v.attributes.map}")`;

      schema += '\n';
    }

    // Enum attributes
    if (e.attributes.map) schema += `  @@map("${e.attributes.map}")\n`;

    schema += '}\n\n';
  }

  for (const m of context.models) {
    // Model name
    schema += `model ${m.name} {\n`;

    for (const f of m.fields) {
      const type = typeof f.type === 'function' ? f.type() : f.type;

      // Field name and type
      schema += `  ${f.name} ${type}`;
      if (f.attributes.list) schema += '[]';
      if (f.attributes.nullable) schema += '?';

      // Field attributes
      if (f.attributes.id) schema += ' @id';
      if (f.attributes.unique) schema += ' @unique';
      if (f.attributes.map) schema += ` @map("${f.attributes.map}")`;
      if (f.attributes.updatedAt) schema += ' @updatedAt';
      if (f.attributes.relation)
        schema += ` @relation(fields: [${f.attributes.relation[0].join(',')}], references: [${f.attributes.relation[1].join(',')}])`;
      if (f.attributes.default) {
        const df = f.attributes.default;
        if (
          df.toString().includes('new Date()') ||
          df.toString().includes('new Date(Date.now())')
        ) {
          schema += ' @default(now())';
        } else {
          const dv = df();
          if (Array.isArray(dv) && dv.length === 0) schema += ' @default([])';
          else if (typeof dv === 'string') schema += ` @default("${dv}")`;
          else if (typeof dv === 'number' || typeof dv === 'boolean')
            schema += ` @default(${dv})`;
          else throw new Error(`Unexpected default value: ${dv}`);
        }
      }

      schema += '\n';
    }

    // Model attributes
    if (m.attributes.id?.length)
      schema += `  @@id([${m.attributes.id.map((i) => i).join(', ')}])\n`;
    if (m.attributes.index?.length)
      schema += `  @@index([${m.attributes.index.map((i) => i).join(', ')}])\n`;
    if (m.attributes.map) schema += `  @@map("${m.attributes.map}")\n`;

    schema += '}\n\n';
  }

  return schema;
}
