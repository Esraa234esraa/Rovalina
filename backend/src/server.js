import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const server = app.listen(env.port, () => {
  console.log(`API running on port ${env.port} (${env.nodeEnv})`);
});

server.on('error', (error) => {
  console.error('HTTP server failed to start:', error);
  process.exit(1);
});

prisma.$connect().catch((error) => {
  console.error('Prisma initial connect failed. API is up, DB features may fail until reconnect:', error);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
