import express from "express";
import {
  createTurf,
  getTurfs,
  updateTurf,
  deleteTurf,
  closeTurf,
} from "../controllers/turfController";
import { isAuth, isBusiness } from "../middleware/auth";

const router = express.Router();

// Create a new turf
router.post("/", isAuth, isBusiness, createTurf);

// Get all turfs for the authenticated business
router.get("/", isAuth, isBusiness, getTurfs);

// Update a turf
router.put("/:id", isAuth, isBusiness, updateTurf);

// Delete a turf
router.delete("/:id", isAuth, isBusiness, deleteTurf);

// Temporarily close a turf
router.patch("/:id/close", isAuth, isBusiness, closeTurf);

export default router;
