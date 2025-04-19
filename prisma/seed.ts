import { PrismaClient } from '@prisma/client';
import { add } from 'date-fns';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a test promoter
  const hashedPassword = await hash('test123', 12);
  const promoter = await prisma.user.upsert({
    where: { email: 'promoter@example.com' },
    update: {},
    create: {
      email: 'promoter@example.com',
      name: 'Test Promoter',
      role: 'PROMOTER',
      password: hashedPassword,
    },
  });

  // Create some test shows
  const now = new Date();
  const shows = [
    {
      title: 'Comedy Night at The Laugh Factory',
      description: 'A night of laughs with upcoming comedians',
      startTime: add(now, { days: 1, hours: 2 }),
      endTime: add(now, { days: 1, hours: 4 }),
      venue: 'The Laugh Factory',
      maxSlots: 5,
      promoterId: promoter.id
    },
    {
      title: 'Open Mic Night',
      description: 'Your chance to shine on stage',
      startTime: add(now, { days: 2, hours: 3 }),
      endTime: add(now, { days: 2, hours: 5 }),
      venue: 'Comedy Club Downtown',
      maxSlots: 8,
      promoterId: promoter.id
    },
    {
      title: 'Weekend Comedy Showcase',
      description: 'Featured performances by local talent',
      startTime: add(now, { days: 3, hours: 4 }),
      endTime: add(now, { days: 3, hours: 6 }),
      venue: 'City Theater',
      maxSlots: 6,
      promoterId: promoter.id
    },
  ];

  for (const show of shows) {
    await prisma.show.create({
      data: show,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
