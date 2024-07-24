import type { Field } from '~/parsers/field';
import type { Context } from '~/types';

const PrismaTypes = {
  string: 'String',
  number: 'Float',
  integer: 'Int',
  boolean: 'Boolean',
  date: 'DateTime',
  object: 'Json',
  unknown: 'Json',
} satisfies Record<Extract<Field['type'], string>, string>;

export function buildPrismaSchema(context: Context) {
  let schema = '';

  for (const e of context.enums) {
    schema += `enum ${e.name} {\n`;
    for (const v of e.values) {
      schema += `  ${v}`;
      if (v.attributes.map) schema += ` @map("${v.attributes.map}")`;
      schema += '\n';
    }
    if (e.attributes.map) schema += `  @@map("${e.attributes.map}")\n`;
    schema += '}\n\n';
  }

  for (const m of context.models) {
    schema += `model ${m.name} {\n`;

    for (const f of m.fields) {
      if (f.attributes.nullable !== f.attributes.optional)
        throw new Error('Nullable and optional are mutually exclusive');

      const type = typeof f.type === 'function' ? f.type() : f.type;
      const t = PrismaTypes[type as keyof typeof PrismaTypes] || type;
      schema += `  ${f.name} ${t}`;

      if (f.attributes.list) schema += '[]';
      if (f.attributes.nullable) schema += '?';

      if (f.attributes.id) schema += ' @id';
      if (f.attributes.unique) schema += ' @unique';
      if (f.attributes.map) schema += ` @map("${f.attributes.map}")`;
      if (f.attributes.updatedAt) schema += ' @updatedAt';

      if (f.attributes.relation)
        schema += ` @relation(fields: [${f.attributes.relation[0].join(',')}], references: [${f.attributes.relation[1].join(',')}])`;

      if (f.attributes.default) {
        const v = f.attributes.default();
        if (v instanceof Date) schema += ' @default(now())';
        else if (Array.isArray(v) && v.length === 0) schema += ' @default([])';
        else if (typeof v === 'string') schema += ` @default("${v}")`;
        else if (typeof v === 'number' || typeof v === 'boolean')
          schema += ` @default(${v})`;
        else throw new Error(`Unexpected default value: ${v}`);
      }

      schema += '\n';
    }

    if (m.attributes.id?.length)
      schema += `  @@id([${m.attributes.id.map((i) => i).join(', ')}])\n`;
    if (m.attributes.index?.length)
      schema += `  @@index([${m.attributes.index.map((i) => i).join(', ')}])\n`;
    if (m.attributes.map) schema += `  @@map("${m.attributes.map}")\n`;

    schema += '}\n\n';
  }

  return `${schema.trim()}\n`;
}
