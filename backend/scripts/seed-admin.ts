/**
 * Run this once to create your first admin user:
 * npx ts-node scripts/seed-admin.ts
 *
 * Update the email/name below to match your Google account email.
 */

import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const email = 'lokeshgaddam2514@gmail.com';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Promote to ADMIN if exists
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Updated existing user to ADMIN: ${updated.email}`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: 'Admin',
      role: 'ADMIN',
      slug: 'admin',
    },
  });
  console.log(`✅ Created admin user: ${user.email} (id: ${user.id})`);
  console.log('Now sign in at http://localhost:3000/login with this Google account.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
