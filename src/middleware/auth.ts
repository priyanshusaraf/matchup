import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"; // Import JwtPayload
import prisma from "../db";
import { AuthenticatedRequest } from "../../types/express"; // Import your custom request type

interface DecodedToken extends JwtPayload {
  id: number; // Ensure the token has an `id` field
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken; // Explicitly cast to DecodedToken

    if (!decoded.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = { id: user.id, role: user.role }; // Attach user properties to request
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    res.status(401).json({ error: "Unauthorized access" });
  }
};
export const isBusiness = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "BUSINESS") {
    return res
      .status(403)
      .json({ error: "Access denied: Business role required" });
  }
  next();
};
