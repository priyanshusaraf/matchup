import express from "express";
import {
  createCourt,
  getCourts,
  updateCourt,
  deleteCourt,
  closeCourt,
} from "../controllers/courtController";
import { isAuth, isBusiness } from "../middleware/auth";

const router = express.Router();

// Create a new court
router.post("/", isAuth, isBusiness, createCourt);

// Get all courts for a turf
router.get("/:turfId", isAuth, isBusiness, getCourts);

// Update court details
router.put("/:id", isAuth, isBusiness, updateCourt);

// Delete a court
router.delete("/:id", isAuth, isBusiness, deleteCourt);

// Temporarily close a court
router.patch("/:id/close", isAuth, isBusiness, closeCourt);

export default router;
