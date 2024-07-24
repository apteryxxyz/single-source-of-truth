#!/usr/bin/env node

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import logger from './logger';
import 'tsx';
import { generate } from './generate';

const [input] = process.argv.slice(2);
if (!input) {
  logger.error('Missing input file argument');
  process.exit(1);
}

const url = pathToFileURL(resolve(input));

async function run() {
  url.searchParams.set('t', Date.now().toString());
  const source = await import(url.toString()) //
    .then((m) => m.default);
  if (source) {
    await generate(source);
  } else {
    logger.error('Missing SourceOfTruth export');
    process.exit(1);
  }
}

logger.info('Generating...');
await run();

import { watchFile } from 'node:fs';
const watch = process.argv.includes('--watch');
if (watch) {
  logger.info('Watching...');
  watchFile(input, async () => {
    logger.info('Regenerating...');
    await run();
  });
}
