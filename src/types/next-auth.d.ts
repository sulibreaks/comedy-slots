import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: UserRole;
    id: string;
  }
  
  interface Session {
    user: User & {
      role: UserRole;
      id: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    id: string;
  }
} 