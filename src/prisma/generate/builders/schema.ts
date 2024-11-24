import type { PrismaEnum } from '../parsers/enum';
import type { PrismaModel } from '../parsers/model';

export function buildPrismaSchema(models: PrismaModel[], enums: PrismaEnum[]) {
  let schema = '';

  // Enums
  for (const e of enums) {
    // Enum name
    schema += `enum ${e.name} {\n`;

    for (const v of e.values) {
      // Field name
      schema += `  ${v}`;
      schema += '\n';
    }

    schema += '}\n\n';
  }

  const enumsStr = schema;

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

      if (f.attributes.relation)
        schema += ` @relation(fields: [${f.attributes.relation[0].join(',')}], references: [${f.attributes.relation[1].join(',')}])`;

      if (f.attributes.default) {
        const df = f.attributes.default;

        if (df.toString().includes('new Date')) {
          schema += ' @default(now())';
        } else {
          const dv = df();

          if (Array.isArray(dv)) schema += ` @default([${dv.join(', ')}])`;
          else if (enumsStr.includes(`  ${dv}`)) schema += ` @default(${dv})`;
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
      schema += `  @@id([${m.attributes.id.join(', ')}])\n`;
    // if (m.attributes.index?.length)
    //   schema += `  @@index([${m.attributes.index.join(', ')}])\n`;
    schema += '}\n\n';
  }

  return `// This file was automatically generated, any changes made here will be lost\n\n${schema}`.trim();
}
