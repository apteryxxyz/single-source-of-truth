import type { Standard } from '~/standard.js';
import { enum_ } from '../schemas/enum.js';
import { field } from '../schemas/field.js';
import type { Model, Shape } from '../schemas/model.js';
import { fieldToStandard } from './field.js';

export function modelToStandard(name: string, model: Model): Standard.Model {
  const fields = Object.entries(model.truth.shape as Shape).map(
    ([name, value]) => {
      if (field.is(value)) {
        const standard = fieldToStandard(name, value);
        if (value.truth.id) standard.attributes.id = true;
        if (value.truth.unique) standard.attributes.unique = true;
        if (value.truth.updatedAt) standard.attributes.updatedAt = true;
        return standard;
      } else if (enum_.is(value)) {
        return {
          name,
          kind: 'enum' as const,
          type: value.truth.name!,
          attributes: {},
        };
      } else {
        return fieldToStandard(name, value());
      }
    },
  );

  const attributes: Standard.Model.Attributes = {};
  if (model.truth.id) attributes.id = model.truth.id as any;
  if (model.truth.unique) attributes.unique = model.truth.unique as any;

  return { name, attributes, fields };
}
