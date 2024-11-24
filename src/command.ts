#!/usr/bin/env node

import { Command } from 'commander';
import prismaCommand from './prisma/command';

const command = new Command('single-source-of-truth')
  .alias('sot')
  .addCommand(prismaCommand)
  .parse();
export default command;

if (!process.argv.slice(2).length) {
  command.outputHelp();
}
