import type { Standard } from './standard.js';

export class Store<Holds> {
  #store = new Map<string, { toStandard(): Holds }>();

  get(name: string) {
    return this.#store.get(name)?.toStandard();
  }

  getAll() {
    return [...this.#store.values()].map((v) => v.toStandard());
  }

  has(name: string) {
    return this.#store.has(name);
  }

  set(name: string, schema: { toStandard(): Holds }) {
    return this.#store.set(name, schema);
  }

  get size() {
    return this.#store.size;
  }

  keys() {
    return this.#store.keys();
  }

  values() {
    return this.#store.values();
  }

  entries() {
    return this.#store.entries();
  }

  get [Symbol.iterator]() {
    return this.#store.values();
  }
}

export class Registry {
  enums = new Store<Standard.Enum>();
  models = new Store<Standard.Model>();
}
