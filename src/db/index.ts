import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// Test the database connection
async function connectDB() {
  try {
    await prisma.$connect();
    console.log("DB is connected!");
  } catch (error) {
    console.error("Could not connect to the database: ", error.message);
    process.exit(1); // Exit process with failure
  }
}

connectDB();

export default prisma;
