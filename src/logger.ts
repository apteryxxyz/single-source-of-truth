import chalk from 'chalk';

function line(content: string) {
  return content.replaceAll(/(?:\n\s*)+/g, ' ');
}

function error(message: string) {
  console.error(chalk.red(`[sot] ${line(message)}`));
}

function warn(message: string) {
  console.warn(chalk.yellow(`[sot] ${line(message)}`));
}

function info(message: string) {
  console.info(chalk.blue(`[sot] ${line(message)}`));
}

export default { error, warn, info };
