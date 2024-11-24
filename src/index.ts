/*


const User = t.model(
  'User',
  z.object({ id: z.string() }),
  { id: ['id'] },
  { connections: 'Connection' },
);

const Connection = t.model(
  'Connection',
  z.object({ userId: z.string(), targetId: z.string() }),
  { id: ['userId', 'targetId'] },
  { user: ['User', ['userId'], ['id']] },
);



*/

export * as t from './export';
export { Models } from './schema/model';
export { Enums } from './schema/enum';
