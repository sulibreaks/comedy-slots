import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/auth.config.mjs';
import { sendBookingStatusEmail } from '@/lib/email';

const prisma = new PrismaClient();

// Validation schema for creating a booking
const createBookingSchema = z.object({
  showId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { showId } = body;

    // Get the show details
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        promoter: true,
      },
    });

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Check if user has already booked this show
    const existingBooking = await prisma.booking.findFirst({
      where: {
        showId,
        userId: session.user.id,
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You have already booked this show' },
        { status: 400 }
      );
    }

    // Check if show is full
    const bookingsCount = await prisma.booking.count({
      where: {
        showId,
        status: 'APPROVED',
      },
    });

    if (bookingsCount >= show.maxSlots) {
      return NextResponse.json(
        { error: 'This show is fully booked' },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        showId,
        userId: session.user.id,
        status: 'PENDING',
      },
      include: {
        show: true,
        user: true,
      },
    });

    // Send email to comedian
    await sendBookingStatusEmail({
      to: session.user.email,
      showTitle: show.title,
      showDate: show.startTime.toLocaleDateString(),
      status: 'PENDING',
      isComedian: true,
    });

    // Send email to promoter
    if (show.promoter.email) {
      await sendBookingStatusEmail({
        to: show.promoter.email,
        showTitle: show.title,
        showDate: show.startTime.toLocaleDateString(),
        status: 'PENDING',
        isComedian: false,
      });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Get user's bookings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        show: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
