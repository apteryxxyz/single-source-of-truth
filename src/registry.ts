import type { Standard } from './standard.js';

export class Registry {
  enums = new Map<string, { toTruth(): Standard.Enum }>();
  models = new Map<string, { toTruth(): Standard.Model }>();
  toTruth(): Standard.Schema {
    return {
      enums: [...this.enums.values()].map((e) => e.toTruth()),
      models: [...this.models.values()].map((m) => m.toTruth()),
    };
  }
}
