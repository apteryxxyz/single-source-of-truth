#!/usr/bin/env node

import { exec } from 'node:child_process';
import { watchFile } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import 'tsx';
import { generate } from './generate';
import logger from './logger';

const [input, ...args] = process.argv.slice(2);
if (!input) {
  logger.error('Missing input file argument');
  process.exit(1);
}

const doWatch = args.indexOf('--watch') !== -1;
const onSuccessIndex = args.indexOf('--on-success');
const onSuccess = onSuccessIndex !== -1 ? args[onSuccessIndex + 1] : null;

async function run() {
  const url = pathToFileURL(resolve(input!));
  url.searchParams.set('t', Date.now().toString());

  const source = await import(url.toString()) //
    .then((m) => m.default);
  if (!source) {
    logger.error('Missing default export');
    process.exit(1);
  }

  await generate(source);
  if (onSuccess) {
    exec(onSuccess, (error, stdout, stderr) => {
      if (error)
        logger.error(`Error executing on success command: ${error.message}`);
      else if (stderr) console.log(stderr);
      else console.log(stdout);
    });
  }
}

logger.info('Generating...');
await run();

if (doWatch) {
  logger.info('Watching...');
  watchFile(input, async () => {
    logger.info('Regenerating...');
    await run();
  });
}
