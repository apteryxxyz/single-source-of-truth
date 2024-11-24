import { Command } from 'commander';
import generateCommand from './generate/command';

const command = new Command('prisma')
  .description('Prisma commands')
  .addCommand(generateCommand);
export default command;
