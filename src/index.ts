import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./db/index.ts"; // Ensure this initializes your database
import authRouter from "./routes/auth";
import turfRouter from "./routes/turfRouter"; // Import turf router
import courtRouter from "./routes/courtRouter";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRouter); // Authentication routes
app.use("/turfs", turfRouter); // Turf management routes

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

// Error Handling Middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.use("/courts", courtRouter);
// Server Setup
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});

// URL to connect to Google for role-based auth: http://localhost:8000/auth/google?role=MANAGER
