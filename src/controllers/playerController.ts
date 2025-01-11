import { Response, NextFunction } from "express";
import prisma from "../db";
import { AuthenticatedRequest } from "../../types/express";

// Get court availability for players
export const getCourtAvailabilityForPlayer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { turfId } = req.query;

    if (!turfId) {
      return res.status(400).json({ error: "Turf ID is required" });
    }

    // Fetch courts and booked slots
    const courts = await prisma.court.findMany({
      where: { turfId: parseInt(turfId as string) },
      include: {
        timings: true,
        bookings: {
          where: {
            status: "active",
          },
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    const availability = courts.map((court) => ({
      courtId: court.id,
      name: court.name,
      sport: court.sport,
      timings: court.timings,
      bookedSlots: court.bookings.map((booking) => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
      })),
    }));

    res.status(200).json({ availability });
  } catch (error) {
    console.error("Error fetching court availability:", error);
    next(error);
  }
};

// Get player-specific bookings
export const getPlayerBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: playerId } = req.user!;

    const bookings = await prisma.booking.findMany({
      where: { userId: playerId },
      include: {
        court: { include: { turf: true } },
      },
      orderBy: { startTime: "desc" },
    });

    const activeBookings = bookings.filter((b) => b.status === "active");
    const pastBookings = bookings.filter((b) => b.status === "completed");

    res.status(200).json({ activeBookings, pastBookings });
  } catch (error) {
    console.error("Error fetching player bookings:", error);
    next(error);
  }
};
