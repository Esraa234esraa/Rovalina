import { spawn } from 'node:child_process';

const MAX_RETRIES = Number(process.env.PRISMA_PUSH_MAX_RETRIES || 5);
const BASE_DELAY_MS = Number(process.env.PRISMA_PUSH_RETRY_DELAY_MS || 2000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runPrismaPush = () =>
  new Promise((resolve, reject) => {
    const child = spawn('npx', ['prisma', 'db', 'push', '--schema=./prisma/schema.prisma'], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: process.env,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`prisma db push failed with exit code ${code}`));
    });
  });

const run = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      console.log(`[prisma-push-retry] Attempt ${attempt}/${MAX_RETRIES}`);
      await runPrismaPush();
      console.log('[prisma-push-retry] Prisma schema push succeeded.');
      return;
    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES;
      console.error(`[prisma-push-retry] ${error.message}`);

      if (isLastAttempt) {
        process.exitCode = 1;
        return;
      }

      const waitMs = BASE_DELAY_MS * attempt;
      console.log(`[prisma-push-retry] Retrying in ${waitMs}ms...`);
      await sleep(waitMs);
    }
  }
};

run().catch((error) => {
  console.error('[prisma-push-retry] Unexpected error:', error);
  process.exit(1);
});
