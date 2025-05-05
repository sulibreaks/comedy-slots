import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/auth.config';

const prisma = new PrismaClient();

// Validation schema for creating a show
const createShowSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  venue: z.string().min(1, 'Venue is required'),
  maxSlots: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'At least one slot is required')
  ),
});

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is a promoter
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (session.user.role !== 'PROMOTER') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createShowSchema.parse(body);

    // Create show
    const show = await prisma.show.create({
      data: {
        ...validatedData,
        promoterId: session.user.id,
      },
      include: {
        promoter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(show);
  } catch (error) {
    console.error('Error creating show:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create show' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Get all shows
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const shows = await prisma.show.findMany({
      include: {
        promoter: {
          select: {
            name: true,
            email: true,
          },
        },
        bookings: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(shows);
  } catch (error) {
    console.error('Error fetching shows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shows' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
