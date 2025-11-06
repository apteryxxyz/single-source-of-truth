<div align='center'>
  <h1><strong>single-source-of-truth</strong></h1>
  <i>Use ArkType schemas to generate your Prisma schema</i><br>
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
pnpm add truth@npm:single-source-of-truth arktype
```

```ts
// src/shapes.ts

import { model, relation } from 'truth/arktype';

export const User = model({
  id: 'string',
  name: 'string',
  posts: () => relation(() => Post.array()),
}, {});
export type User = typeof User.infer;
//           ^? { id: string, name: string }

export const Post = model({
  id: 'string',
  authorId: 'string',
  title: 'string',
  author: () => relation(() => User, [['authorId', 'id']]),
}, {});
export type Post = typeof Post.infer;
//           ^? { id: string, authorId: string, title: string }
~
const UserWithPosts = User.include('posts');
type UserWithPosts = typeof UserWithPosts.infer;
//           ^? { id: string, name: string, posts: Post[] }
```

```ts
// truth.config.ts

import { defineConfig } from 'truth/config';

export default defineConfig(({ registry, arktype, prisma }) => {
  await arktype.import(registry, './src/shapes.ts');
  await prisma.export(registry, './prisma/generated.prisma');
});
```

```sh
truth
```

```prisma
model User {
  id String @id
  name String
  posts Post[]
}

model Post {
  id String @id
  authorId String
  title String
  author User @relation(fields: [authorId], references: [id])
}
```
