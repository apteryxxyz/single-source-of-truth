import Cursor from 'code-block-writer';
import type { Standard } from '~/standard.js';

export function buildEnumBlock(ēnum: Standard.Enum) {
  const cursor = new Cursor({ indentNumberOfSpaces: 2 });

  cursor.write(`enum ${ēnum.name}`).block(() => {
    for (const value of ēnum.values) cursor.writeLine(value.name);
  });

  return cursor.toString();
}
