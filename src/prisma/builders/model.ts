import Cursor from 'code-block-writer';
import type { Standard } from '~/standard.js';
import { buildFieldLine } from './field.js';

export function buildModelBlock(model: Standard.Model) {
  const cursor = new Cursor({ indentNumberOfSpaces: 2 });

  cursor.write(`model ${model.name}`).block(() => {
    for (const field of model.fields) cursor.writeLine(buildFieldLine(field));

    if (model.attributes.id?.length)
      cursor.writeLine(`@@id([${model.attributes.id.join(', ')}])`);

    if (model.attributes.unique?.length)
      for (const unique of model.attributes.unique)
        cursor.writeLine(`@@unique([${unique.join(', ')}])`);
  });

  return cursor.toString();
}
