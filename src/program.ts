#!/usr/bin/env node

import { program } from 'commander/esm.mjs';
import prismaCommand from './prisma/command';

program
  .name('single-source-of-truth')
  .alias('sot')
  .addCommand(prismaCommand)
  .parse();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
