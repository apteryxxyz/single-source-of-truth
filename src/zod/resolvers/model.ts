import type { Standard } from '~/standard';
import type { TruthModel } from '../schemas/model.js';
import { parseFieldSchema } from './field.js';

export function parseModelSchema(name: string, schema: TruthModel<any>) {
  const fields = Object.entries({
    ...schema.def.shape,
    ...schema.def.relations,
  }).map(([k, v]) => parseFieldSchema(k, v as never));
  return { name, attributes: schema.def.attributes, fields } as Standard.Model;
}
