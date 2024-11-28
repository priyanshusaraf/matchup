import { Response, NextFunction } from "express";
import prisma from "../db";
import { AuthenticatedRequest } from "../../types/express";

// Create a new court
export const createCourt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, sport, turfId, prices, timings } = req.body;

    if (!name || !sport || !turfId || !prices || !timings) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const court = await prisma.court.create({
      data: {
        name,
        sport,
        turfId,
        prices: { create: prices }, // Prices array [{ type, amount }]
        timings: { create: timings }, // Timings array [{ startTime, endTime }]
      },
    });

    res.status(201).json({ message: "Court created successfully", court });
  } catch (error) {
    console.error("Error creating court:", error);
    next(error);
  }
};

// Get all courts for a turf
export const getCourts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { turfId } = req.params;

    const courts = await prisma.court.findMany({
      where: { turfId: parseInt(turfId) },
      include: {
        timings: true, // Include operational timings
        prices: true, // Include pricing details
      },
    });

    res.status(200).json({ courts });
  } catch (error) {
    console.error("Error fetching courts:", error);
    next(error);
  }
};

// Update court details
export const updateCourt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, sport, prices, timings, isTemporarilyClosed } = req.body;

    const court = await prisma.court.update({
      where: { id: parseInt(id) },
      data: {
        name,
        sport,
        isTemporarilyClosed,
        prices: {
          deleteMany: {}, // Remove existing prices
          create: prices, // Add new prices
        },
        timings: {
          deleteMany: {}, // Remove existing timings
          create: timings, // Add new timings
        },
      },
    });

    res.status(200).json({ message: "Court updated successfully", court });
  } catch (error) {
    console.error("Error updating court:", error);
    next(error);
  }
};

// Delete a court
export const deleteCourt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete court with ID: ${id}`);

    // Check if the court exists
    const court = await prisma.court.findUnique({
      where: { id: parseInt(id) },
    });

    if (!court) {
      console.log(`Court with ID ${id} not found.`);
      return res.status(404).json({ error: "Court not found" });
    }

    console.log(`Deleting bookings associated with court ID: ${id}`);
    await prisma.booking.deleteMany({
      where: { courtId: parseInt(id) },
    });

    console.log(`Deleting prices associated with court ID: ${id}`);
    await prisma.price.deleteMany({
      where: { courtId: parseInt(id) },
    });

    console.log(`Deleting timings associated with court ID: ${id}`);
    await prisma.timing.deleteMany({
      where: { courtId: parseInt(id) },
    });

    console.log(`Deleting court with ID: ${id}`);
    await prisma.court.delete({
      where: { id: parseInt(id) },
    });

    console.log(`Court with ID ${id} deleted successfully.`);
    res.status(200).json({ message: "Court deleted successfully" });
  } catch (error) {
    console.error("Error deleting court:", error);
    next(error);
  }
};

// Temporarily close a court
export const closeCourt = async (
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

    const court = await prisma.court.update({
      where: { id: parseInt(id) },
      data: { isTemporarilyClosed },
    });

    res
      .status(200)
      .json({ message: "Court status updated successfully", court });
  } catch (error) {
    console.error("Error closing court:", error);
    next(error);
  }
};
