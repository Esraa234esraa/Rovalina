import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const startServer = async () => {
  await prisma.$connect();

  const server = app.listen(env.port, () => {
    console.log(`API running on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch(async (error) => {
  console.error('Failed to start server:', error);
  await prisma.$disconnect();
  process.exit(1);
});
