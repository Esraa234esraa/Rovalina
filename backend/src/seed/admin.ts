import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@rovalina.com';
  const password = 'Admin@2026#Rovalina';
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
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

  console.log('Admin created', admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
