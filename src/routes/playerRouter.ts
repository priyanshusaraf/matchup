import express from "express";
import {
  getCourtAvailabilityForPlayer,
  getPlayerBookings,
} from "../controllers/playerController";
import { createBooking } from "../controllers/bookingController";
import { isAuth } from "../middleware/auth";

const router = express.Router();

// Get court availability for players
router.get("/courts/availability", isAuth, getCourtAvailabilityForPlayer);

// Create a new booking
router.post("/bookings", isAuth, createBooking);

// Get player-specific bookings
router.get("/bookings/player", isAuth, getPlayerBookings);

export default router;
