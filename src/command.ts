#!/usr/bin/env node

import 'tsx';
import { pathToFileURL } from 'node:url';
import { Command } from 'commander';
import type { ConfigFn } from './config.js';
import { Registry } from './registry.js';

const program = new Command('truth').action(async () => {
  const configPath = pathToFileURL('truth.config.ts').toString();
  const configFn = await import(configPath) //
    .then((m) => m.default as ConfigFn);

  return configFn({
    registry: new Registry(),
    zod: await import('./zod/config'),
    prisma: await import('./prisma/config'),
  });
});

program.parse(process.argv);
