import {
  createUser,
  signin,
  sendProfile,
  adminResponse,
} from "../controllers/auth";
import { newUserValidator } from "../middleware/validator";
import { Router, RequestHandler } from "express";
import { verifyToken } from "../utils/jwt";
import prisma from "../db"; // Import Prisma client

const authRouter = Router();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: "PLAYER" | "MANAGER" | "BUSINESS";
      };
    }
  }
}

// Middleware: isAuth
const isAuth: RequestHandler = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader?.split("Bearer ")[1];
    if (!token) {
      return res
        .status(403)
        .json({ error: "Unauthorized access: No token provided." });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res
        .status(403)
        .json({ error: "Unauthorized access: User not found." });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "PLAYER" | "MANAGER" | "BUSINESS",
    };

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(403).json({ error: "Unauthorized access." });
  }
};

// Middleware: isManager (Admin Role)
const isManager: RequestHandler = (req, res, next) => {
  if (req.user?.role === "MANAGER") {
    return next();
  } else {
    return res.status(403).json({ error: "Access denied: Managers only." });
  }
};

// Routes
authRouter.post("/signup", newUserValidator, createUser);
authRouter.post("/signin", signin);
authRouter.get("/profile", isAuth, sendProfile);
authRouter.get("/admin", isAuth, isManager, adminResponse);

export default authRouter;
