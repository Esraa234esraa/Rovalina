import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
dotenv.config({ override: true });
const globalRef = globalThis;
const createClient = () => new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});
export const prisma = globalRef.prisma ?? createClient();
if (process.env.NODE_ENV !== 'production') {
    globalRef.prisma = prisma;
}
