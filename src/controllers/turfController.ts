import { Response, NextFunction } from "express";
import prisma from "../db";
import { AuthenticatedRequest } from "../../types/express"; // Import from the types folder

// Create a new turf
export const createTurf = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, location, latitude, longitude } = req.body;

    if (!name || !location || !latitude || !longitude) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const turf = await prisma.turf.create({
      data: {
        name,
        location,
        latitude,
        longitude,
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
      include: { courts: true, bookings: true }, // Include related courts and bookings
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
      where: { id: parseInt(id) },
      data: {
        name,
        location,
        latitude,
        longitude,
        isTemporarilyClosed,
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
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
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
