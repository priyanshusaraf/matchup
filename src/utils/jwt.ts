import jwt, { JwtPayload } from "jsonwebtoken";

export interface TokenPayload {
  id: number;
  role: string; // Ensure it matches the token structure
}

// Sign a token
export const signToken = (payload: TokenPayload, expiresIn = "1h"): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Verify a token
export const verifyToken = (token: string): TokenPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (typeof decoded === "string") {
    throw new Error("Invalid token structure.");
  }

  return decoded as TokenPayload;
};
