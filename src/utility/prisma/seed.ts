import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.create({
    data: {
      name: 'glamourscan',
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@glamourscan.com',
      username: 'glamourscanadmin',
      password: '',
      role: 'ADMIN',
      company: {
        connect: { id: company.id },
      }
    }
  })

  await prisma.company.update({
    where: { id: company.id },
    data: {
      owner: {
        connect: {
          id: admin.id,
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect();
  });