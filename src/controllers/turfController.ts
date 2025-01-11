import { Response, NextFunction } from "express";
import prisma from "../db";
import { AuthenticatedRequest } from "../../types/express"; // Import from the types folder

// Helper function to parse integer IDs
const parseId = (id: string): number => {
  const parsed = parseInt(id);
  if (isNaN(parsed)) {
    throw new Error("Invalid ID");
  }
  return parsed;
};

// Create a new turf
export const createTurf = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, location, latitude, longitude } = req.body;

    if (
      !name ||
      !location ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const turf = await prisma.turf.create({
      data: {
        name,
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        ownerId: req.user!.id, // Authenticated user ID
      },
    });

    res.status(201).json({ message: "Turf created successfully", turf });
  } catch (error) {
    console.error("Error creating turf:", error);
    next(error);
  }
};

// Get all turfs for the authenticated business
export const getTurfs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const turfs = await prisma.turf.findMany({
      where: { ownerId: req.user!.id },
      include: { courts: true, bookings: true },
    });

    res.status(200).json({ turfs });
  } catch (error) {
    console.error("Error fetching turfs:", error);
    next(error);
  }
};

// Update turf details
export const updateTurf = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, location, latitude, longitude, isTemporarilyClosed } =
      req.body;

    const turf = await prisma.turf.update({
      where: { id: parseId(id) },
      data: {
        ...(name && { name }),
        ...(location && { location }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(isTemporarilyClosed !== undefined && { isTemporarilyClosed }),
      },
    });

    res.status(200).json({ message: "Turf updated successfully", turf });
  } catch (error) {
    console.error("Error updating turf:", error);
    next(error);
  }
};

// Delete a turf
export const deleteTurf = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.turf.delete({
      where: { id: parseId(id) },
    });

    res.status(200).json({ message: "Turf deleted successfully" });
  } catch (error) {
    console.error("Error deleting turf:", error);
    next(error);
  }
};

// Mark a turf as temporarily closed
export const closeTurf = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isTemporarilyClosed } = req.body;

    if (typeof isTemporarilyClosed !== "boolean") {
      return res.status(400).json({ error: "Invalid closure status" });
    }

    const turf = await prisma.turf.update({
      where: { id: parseId(id) },
      data: {
        isTemporarilyClosed,
      },
    });

    res.status(200).json({ message: "Turf status updated successfully", turf });
  } catch (error) {
    console.error("Error updating turf status:", error);
    next(error);
  }
};
