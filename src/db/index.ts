import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env");
}

export const db = new Pool({
  connectionString,
});

export async function connectDB() {
  try {
    await db.query("SELECT 1");
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}