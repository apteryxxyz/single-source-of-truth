import Cursor from 'code-block-writer';
import type { Standard } from '~/standard';
import { buildEnumBlock } from './enum.js';
import { buildModelBlock } from './model.js';

export function buildSchema(schema: Standard.Schema) {
  const cursor = new Cursor({ indentNumberOfSpaces: 2 });
  for (const enum_ of schema.enums)
    cursor.writeLine(buildEnumBlock(enum_)).newLine();
  for (const model of schema.models)
    cursor.writeLine(buildModelBlock(model)).newLine();
  return cursor.toString();
}
