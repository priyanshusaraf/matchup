// types/express.d.ts
import { Role } from "@prisma/client"; // Import Role enum from Prisma

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
