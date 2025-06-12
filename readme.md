<div align='center'>
  <h1><strong>single-source-of-truth</strong></h1>
  <i>Use Zod schemas to generate your Prisma schema</i><br>
  <code>pnpm add truth@npm:single-source-of-truth zod</code>
</div>

<div align='center'>
  <img alt='package version' src='https://img.shields.io/npm/v/single-source-of-truth?label=version'>
  <img alt='total downloads' src='https://img.shields.io/npm/dt/single-source-of-truth'>
  <br>
  <a href='https://github.com/apteryxxyz/single-source-of-truth'><img alt='single-source-of-truth repo stars' src='https://img.shields.io/github/stars/apteryxxyz/single-source-of-truth?style=social'></a>
  <a href='https://github.com/apteryxxyz'><img alt='apteryxxyz followers' src='https://img.shields.io/github/followers/apteryxxyz?style=social'></a>
  <a href='https://discord.gg/g5wz46CXNK'><img src='https://discordapp.com/api/guilds/829836158007115806/widget.png?style=shield' alt='discord shield'/></a>
</div>

```sh
pnpm add truth@npm:single-source-of-truth zod
```

```ts
// src/shapes.ts

import * as t from "truth/zod/v4";
import * as z from "zod/v4";

export const User = t.model({
  id: z.string()[t.id]()[t.unique](),
  get posts() {
    return t.relation(() => Post).array();
  },
});
export type User = z.infer<typeof User>;
//           ^? { id: string }

export const Post = t.model({
  id: z.string()[t.id]()[t.unique](),
  authorId: z.string(),
  get author() {
    return t.relation(() => User).reference("authorId", "id");
  },

  title: z.string(),
});
export type Post = z.infer<typeof Post>;
//           ^? { id: string, authorId: string, title: string }

const UserWithPosts = User.with("posts");
type UserWithPosts = z.infer<typeof UserWithPosts>;
//        ^? { id: string, posts: Post[] }
```

```ts
// truth.config.ts

import { defineConfig } from "truth/config";

export default defineConfig(({ registry, "zod/v4": zod, prisma }) => {
  await zod.import(registry, "./src/shapes.ts");
  await prisma.build(registry, "./prisma/schema.prisma");
});
```

```sh
truth
```

```prisma
model User {
  id String @id @unique
  posts Post[]
}

model Post {
  id String @id @unique
  authorId String
  author User @relation(fields: [authorId], references: [id])
  title String
}
```
