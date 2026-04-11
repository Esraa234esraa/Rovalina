import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ override: true });

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalRef = globalThis as GlobalWithPrisma;

const createClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

export const prisma = globalRef.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalRef.prisma = prisma;
}
