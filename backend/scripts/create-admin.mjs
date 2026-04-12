import bcrypt from 'bcrypt';
import { prisma } from '../src/config/prisma.js';

const SALT_ROUNDS = 10;

const normalize = (value) => String(value || '').trim();

const run = async () => {
  const email = normalize(process.env.ADMIN_EMAIL).toLowerCase();
  const password = normalize(process.env.ADMIN_PASSWORD);

  if (!email || !password) {
    console.error('Missing credentials. Provide ADMIN_EMAIL and ADMIN_PASSWORD as temporary env vars.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      name: 'Admin',
    },
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      name: 'Admin',
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  console.log(`Admin ready: ${user.email} (${user.role})`);
};

run()
  .catch((error) => {
    console.error('Failed to create admin:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
