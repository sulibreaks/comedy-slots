import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { signUpSchema } from '@/lib/validations';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received signup request:', body);
    
    // Validate and transform input
    const validatedData = signUpSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user with proper UserRole type
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password, // Store password directly
        role: validatedData.role as UserRole,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
