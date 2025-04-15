import chalk from 'chalk';

function line(content: string) {
  return content.replaceAll(/(?:\n\s*)+/g, ' ');
}

function error(message: string) {
  console.error(chalk.red(`[truth] ${line(message)}`));
}

function warn(message: string) {
  console.warn(chalk.yellow(`[truth] ${line(message)}`));
}

function info(message: string) {
  console.info(chalk.blue(`[truth] ${line(message)}`));
}

export default { error, warn, info };
