import prisma from './prisma/generate';

export async function generate(config: {
  prisma?: Parameters<typeof prisma>[0];
}) {
  if (config.prisma) prisma(config.prisma);
}
