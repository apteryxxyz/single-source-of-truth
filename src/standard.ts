export namespace Standard {
  export interface Schema {
    enums: Enum[];
    models: Model[];
  }

  export interface Enum {
    name: string;
    values: Enum.Value[];
  }

  export namespace Enum {
    export interface Value {
      name: string;
    }
  }

  export interface Model {
    name: string;
    fields: Model.Field[];
    attributes: Model.Attributes;
  }

  export namespace Model {
    export interface Attributes {
      id?: string[];
      unique?: string[][];
    }

    export type Field = Field.Enum | Field.Scalar | Field.Object;

    export namespace Field {
      export interface Attributes {
        id?: boolean;
        unique?: boolean;
        updatedAt?: boolean;
        nullable?: boolean;
        list?: boolean;
        name?: string;
        references?: [string, string][];
      }

      interface Base {
        name: string;
        attributes: Attributes;
      }

      export interface Scalar extends Base {
        kind: 'scalar';
        type: Scalar.Type;
      }

      export namespace Scalar {
        export type Type =
          | 'string'
          | 'integer'
          | 'float'
          | 'boolean'
          | 'date'
          | 'bigint'
          | 'object';
      }

      export interface Enum extends Base {
        kind: 'enum';
        type: string; // references Enum.name
      }

      export interface Object extends Base {
        kind: 'object';
        type: string; // references Model.name
      }

      export type Kind = 'scalar' | 'enum' | 'object';
      export type Type = Scalar.Type | (string & {});
    }
  }
}

Array.from({ length: 8 }, (_, i) => i + 1);
