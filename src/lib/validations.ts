import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
