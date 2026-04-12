import { access, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const isExistingFile = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const parseSqlitePath = (databaseUrl) => {
  const value = String(databaseUrl || '').trim();
  if (!value.startsWith('file:')) return null;

  const rawPath = value.slice('file:'.length);
  if (!rawPath) return null;

  if (rawPath.startsWith('/')) {
    return rawPath;
  }

  return path.resolve(process.cwd(), rawPath);
};

const run = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  const targetPath = parseSqlitePath(databaseUrl);

  if (!targetPath) {
    return;
  }

  const normalizedTarget = targetPath.replace(/\\/g, '/');
  if (!normalizedTarget.startsWith('/data/')) {
    return;
  }

  if (await isExistingFile(targetPath)) {
    return;
  }

  const sourcePath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  if (!(await isExistingFile(sourcePath))) {
    console.log('No local seed database found at prisma/dev.db, skipping bootstrap copy.');
    return;
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
  console.log(`Bootstrapped SQLite database to ${targetPath}`);
};

run().catch((error) => {
  console.error('Failed preparing Railway database file:', error);
  process.exit(1);
});
