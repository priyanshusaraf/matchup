import express from "express";
import {
  createBooking,
  getRecentBookings,
  updateBookingStatus,
} from "../controllers/bookingController";
import { isAuth, isBusiness } from "../middleware/auth";

const router = express.Router();

// Create a new booking
router.post("/", isAuth, createBooking);

// Get recent bookings for a business
router.get("/recent", isAuth, isBusiness, getRecentBookings);

// Update booking status
router.patch("/:id/status", isAuth, isBusiness, updateBookingStatus);

export default router;
