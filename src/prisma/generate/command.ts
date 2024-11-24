import 'tsx';
import { exec } from 'node:child_process';
import { watchFile } from 'node:fs';
import { mkdir as makeDirectory, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { Command } from 'commander';
import logger from '~/logger';
import { Enums } from '~/schema/enum';
import { Models } from '~/schema/model';
import { buildPrismaSchema } from './builders/schema';
import { parseEnum } from './parsers/enum';
import { parseModel } from './parsers/model';

const execAsync = promisify(exec);

const command = new Command('generate')
  .description('Generate Prisma schema')
  .argument('<input>', 'Input path to the models declaration file')
  .argument('<output>', 'Output path for the Prisma schema')
  .option('-w, --watch', 'Watch for changes')
  .option('-s, --on-success <command>', 'Command to execute on success')
  .action(
    async (
      inputPath: string,
      outputPath: string,
      options: { watch?: boolean; onSuccess?: string },
    ) => {
      async function run() {
        const url = pathToFileURL(resolve(inputPath));
        url.searchParams.set('t', Date.now().toString());

        logger.info('Loading models declaration...');
        const out = await import(url.toString());
        void out;

        logger.info('Generating Prisma schema...');
        const enums = Object.entries(Enums) //
          .map(([n, s]) => parseEnum(n, s as never));
        const models = Object.entries(Models) //
          .map(([n, s]) => parseModel(n, s as never));
        const schema = buildPrismaSchema(models, enums);

        logger.info('Writing Prisma schema...');
        await makeDirectory(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, schema);

        if (options.onSuccess) {
          logger.info('Executing on success command...');
          await execAsync(options.onSuccess);
        }

        logger.info('Done');
      }

      logger.info('Generating...');
      await run();

      if (options.watch) {
        logger.info('Watching...');
        watchFile(inputPath, async () => {
          logger.info('Regenerating...');
          await run();
        });
      }
    },
  );
export default command;
