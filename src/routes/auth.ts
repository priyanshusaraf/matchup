import {
  createUser,
  signin,
  sendProfile,
  adminResponse,
} from "../controllers/auth";
import { Router, RequestHandler } from "express";
import { verifyToken, signToken } from "../utils/jwt";
import prisma from "../db"; // Import Prisma client
import passport from "../utils/passport"; // For Google OAuth

const authRouter = Router();

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
      role: user.role,
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

// Google OAuth Routes
authRouter.get("/google", (req, res, next) => {
  const { role } = req.query;

  if (!role || !["PLAYER", "MANAGER", "BUSINESS"].includes(role as string)) {
    return res.status(400).json({ error: "Invalid or missing role." });
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: JSON.stringify({ role }),
  })(req, res, next);
});
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(500).json({ error: "Google authentication failed." });
      }

      // Generate JWT token
      // Generate JWT token
      const token = signToken({
        id: user.id,
        role: user.role,
      });

      res.json({
        message: "Google OAuth successful.",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error in Google OAuth callback:", error);
      res.status(500).json({ error: "Google OAuth callback failed." });
    }
  }
);

// Routes
authRouter.post("/signup", createUser);
authRouter.post("/signin", signin);
authRouter.get("/profile", isAuth, sendProfile);
authRouter.get("/admin", isAuth, isManager, adminResponse);

export default authRouter;
