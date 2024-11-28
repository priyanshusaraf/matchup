// types/express.d.ts
import { Role } from "@prisma/client"; // Import Role enum from Prisma
import { Request } from "express";
import { User } from "@prisma/client"; // Prisma User model

// Authenticated Request Interface
export interface AuthenticatedRequest extends Request {
  user?: Pick<User, "id" | "role">; // Include only the necessary fields from User
}
declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      email: string;
      role: Role;
    }

    interface Request {
      user?: User; // Attach the User type to the Request object
    }
  }
}

// This is necessary to make the file a module
export {};
