import { z } from 'zod';

declare module 'zod' {
  interface ZodDate {
    default(d: z.util.noUndefined<Date> | typeof Date.now): z.ZodDefault<this>;
    default(d: () => z.util.noUndefined<Date>): z.ZodDefault<this>;
  }
}

export const ModelAttributes = z
  .object({
    map: z.string(),
    id: z.string().array(),
    index: z.string().array(),
  })
  .partial();
function model<T extends z.input<typeof ModelAttributes>>(attributes: T) {
  return { prisma_model: ModelAttributes.parse(attributes) as T };
}

export const FieldAttributes = z
  .object({
    map: z.string(),
    id: z.boolean(),
    unique: z.boolean(),
    updatedAt: z.boolean(),
    list: z.boolean(),
    nullable: z.boolean(),
    default: z.function(),
  })
  .partial();
function field<T extends z.input<typeof FieldAttributes>>(attributes: T) {
  return { prisma_field: FieldAttributes.parse(attributes) as T };
}

export const FieldRelationAttributes = z.object({
  relation: z.tuple([z.string().array(), z.string().array()]),
});
function relation<
  T extends z.input<typeof FieldRelationAttributes>['relation'],
>(attributes: T) {
  return {
    prisma_field: FieldRelationAttributes.parse({ relation: attributes }) as {
      relation: T;
    },
  };
}

export const EnumAttributes = z
  .object({
    map: z.string(),
  })
  .partial();
function ēnum<T extends z.input<typeof EnumAttributes>>(attributes: T) {
  return { prisma_enum: EnumAttributes.parse(attributes) as T };
}

export const ValueAttributes = z
  .object({
    map: z.string(),
  })
  .partial();
function value<T extends z.input<typeof ValueAttributes>>(attributes: T) {
  return { prisma_value: ValueAttributes.parse(attributes) as T };
}

export default Object.assign(
  {},
  {
    model,
    field: Object.assign(field, { relation }),
    enum: ēnum,
    value,
  },
);
