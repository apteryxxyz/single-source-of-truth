import type { Standard } from '~/standard.js';
import type { Model } from '../schemas/model.js';
import { parseField } from './field.js';

export function parseModel(name: string, model: Model<any>): Standard.Model {
  const fields = Object.entries(model.truth.shape).map(([key, schema]) => {
    const type =
      typeof schema === 'function' && schema.toString().includes('relation')
        ? schema()
        : schema;
    const field = parseField(key, type);
    if (
      model.truth.attributes.id === key ||
      (model.truth.attributes.id === undefined && key === 'id')
    )
      field.attributes.id = true;
    if (model.truth.attributes.unique?.includes(key))
      field.attributes.unique = true;
    return field;
  });

  const attributes: Standard.Model.Attributes = {};
  if (Array.isArray(model.truth.attributes.id))
    attributes.id = model.truth.attributes.id as string[];
  for (const unique of model.truth.attributes.unique ?? [])
    if (Array.isArray(unique)) {
      attributes.unique = attributes.unique ?? [];
      attributes.unique.push(unique as string[]);
    }

  return { name, attributes, fields };
}
