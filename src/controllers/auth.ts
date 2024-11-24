import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";
import { signToken, verifyToken, TokenPayload } from "../utils/jwt";
import { successResponse, errorResponse } from "../utils/response";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const Roles = {
  PLAYER: "PLAYER",
  MANAGER: "MANAGER",
  BUSINESS: "BUSINESS",
} as const;

// Create a new user (Sign up)
export const createUser: RequestHandler = async (req, res) => {
  try {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password || !role) {
      return errorResponse(res, "All fields are required!", 400);
    }

    if (!Object.values(Roles).includes(role)) {
      return errorResponse(res, "Invalid role provided!", 400);
    }

    const oldUser = await prisma.user.findUnique({ where: { email } });
    if (oldUser) {
      return errorResponse(res, "The email is already in use!", 403);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword, role },
    });

    return successResponse(res, "User created successfully.", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

// Sign in an existing user
export const signin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required!", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse(res, "User not found!", 404);

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return errorResponse(res, "Email/Password doesn't match!", 403);
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      role: user.role,
    };

    const token = signToken(tokenPayload);

    return successResponse(res, "Signin successful.", {
      token,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during signin:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

// Admin-only route response
export const adminResponse: RequestHandler = (req, res) => {
  const adminRoles = ["MANAGER"]; // Add flexibility for future roles
  if (!req.user || !adminRoles.includes(req.user.role)) {
    return errorResponse(res, "Access denied: Admins only.", 403);
  }
  return successResponse(res, "Welcome, Manager!");
};

// Get the current user's profile
export const sendProfile: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId || isNaN(userId)) {
      return errorResponse(res, "Unauthorized access!", 403);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return errorResponse(res, "User not found!", 404);
    }

    return successResponse(res, "User profile retrieved successfully.", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error sending profile:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};
