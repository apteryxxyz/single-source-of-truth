#!/usr/bin/env tsx

import { pathToFileURL } from 'node:url';
import { generate } from './generate';

const [input] = process.argv.slice(2);
if (!input) {
  console.error('Missing input file');
  process.exit(1);
}

import 'tsx';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve(input));
const source = await import(url.toString());
if (!source?.SourceOfTruth) {
  console.error('Missing SourceOfTruth export');
  process.exit(1);
}

await generate(source.SourceOfTruth);
console.info('Done');
process.exit(0);
