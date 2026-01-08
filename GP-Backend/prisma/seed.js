// prisma/seed.js


import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

await prisma.provider.upsert({
  where: { rfc: 'ABC123456T12' },
  update: {},
  create: { rfc: 'ABC123456T12', businessName: 'Proveedor Demo SA de CV', isApproved: true },
});
await prisma.$disconnect();

async function main() {
  // Roles
  const [ADMIN, APPROVER, PROVIDER] = await Promise.all([
    prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN' } }),
    prisma.role.upsert({ where: { name: 'APPROVER' }, update: {}, create: { name: 'APPROVER' } }),
    prisma.role.upsert({ where: { name: 'PROVIDER' }, update: {}, create: { name: 'PROVIDER' } }),
  ]);

  // Admin inicial
  const passwordHash = await bcrypt.hash('Aa12345!', 10);
  await prisma.user.upsert({
    where: { email: 'jtelpalo@mbqinc.com' },
    update: {},
    create: {
      email: 'jtelpalo@mbqinc.com',
      fullName: 'Approver MBQ',
      passwordHash,
      mustChangePassword: true,
      roles: { create: [{ roleId: APPROVER.id }] }
    }
  });

  // Tipos de documento básicos
  const docTypes = [
    { name: 'Constancia de Situación Fiscal', isRequired: true },
    { name: 'Comprobante Bancario', isRequired: true },
    { name: 'Identificación Oficial', isRequired: false },
    { name: 'Opinión de Cumplimiento', isRequired: false },
  ];
  for (const dt of docTypes) {
    await prisma.documentType.upsert({
      where: { name: dt.name },
      update: { isRequired: dt.isRequired },
      create: dt
    });
  }

  console.log('Seed OK: roles, admin, document types');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });