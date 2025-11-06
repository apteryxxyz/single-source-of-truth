#!/usr/bin/env node

import 'tsx';
import { pathToFileURL } from 'node:url';
import { Command } from 'commander';
import type { Config } from './config.js';
import { Registry } from './registry.js';

const program = new Command('truth').action(async () => {
  const configPath = pathToFileURL('truth.config.ts').toString();
  const configFn = await import(configPath) //
    .then((m) => m.default as Config);

  return configFn({
    registry: new Registry(),
    arktype: await import('./arktype/config'),
    prisma: await import('./prisma/config'),
  });
});

program.parse(process.argv);
