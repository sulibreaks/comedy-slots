import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/auth.config';
import { sendBookingStatusEmail } from '@/lib/email';

const prisma = new PrismaClient();

// Add GET handler
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        show: {
          include: {
            promoter: true,
          },
        },
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to view this booking
    const isAuthorized = 
      booking.user.email === session.user.email || // Comedian viewing their own booking
      booking.show.promoter.email === session.user.email; // Promoter viewing booking for their show

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    // Get the booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        show: {
          include: {
            promoter: true,
          },
        },
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify that the user is the promoter of the show
    if (booking.show.promoter.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        show: true,
        user: true,
      },
    });

    // Send email notification to the comedian
    await sendBookingStatusEmail({
      to: booking.user.email,
      showTitle: booking.show.title,
      showDate: booking.show.startTime.toLocaleDateString(),
      status: status,
      isComedian: true,
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 