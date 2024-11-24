import prisma from "../db";
import { User, Role } from "@prisma/client";
import bcrypt from "bcrypt";

// Create a new user

export const createUser = async (data: {
  email: string;
  name: string;
  password: string;
  role?: Role;
}): Promise<User | null> => {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role || Role.PLAYER, // Default to PLAYER
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
};

// Find user by email
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
};

// Find user by ID
export const findUserById = async (id: number): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({ where: { id } });
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
};

// Compare passwords
export const comparePassword = async (
  enteredPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(enteredPassword, hashedPassword);
};

// Update user
export const updateUser = async (
  id: number,
  data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
): Promise<User | null> => {
  try {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10); // Hash new password
    }

    return await prisma.user.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
};

// Delete user
export const deleteUser = async (id: number): Promise<User | null> => {
  try {
    return await prisma.user.delete({ where: { id } });
  } catch (error) {
    console.error("Error deleting user:", error);
    return null;
  }
};
