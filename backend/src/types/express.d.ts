import type { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        isActive: boolean;
        firstName: string | null;
        lastName: string | null;
        name: string | null;
      };
    }
  }
}

export {};
