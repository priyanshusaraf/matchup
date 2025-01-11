import { Response, NextFunction } from "express";
import prisma from "../db";
import { AuthenticatedRequest } from "../../types/express";

// Create a new booking
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courtId, turfId, startTime, endTime, totalAmount } = req.body;
    const { id: playerId } = req.user!;

    // Validate required fields
    if (!courtId || !turfId || !startTime || !endTime || !totalAmount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        courtId,
        AND: [
          { startTime: { lte: new Date(endTime) } },
          { endTime: { gte: new Date(startTime) } },
        ],
      },
    });

    if (conflictingBooking) {
      return res
        .status(400)
        .json({ error: "Court is already booked for the selected time slot" });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        courtId,
        turfId,
        userId: playerId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalAmount,
        status: "active", // Default status
      },
    });

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    next(error);
  }
};

// Update booking status
export const updateBookingStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "canceled", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res
      .status(200)
      .json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    next(error);
  }
};

// Get recent bookings for a business
export const getRecentBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: businessId } = req.user!;

    // Fetch bookings for all courts owned by the business
    const bookings = await prisma.booking.findMany({
      where: {
        court: {
          turf: {
            ownerId: businessId,
          },
        },
      },
      include: {
        court: true, // Include court details
        user: true, // Include player details
      },
      orderBy: {
        startTime: "desc",
      },
      take: 10, // Fetch the most recent 10 bookings
    });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    next(error);
  }
};
