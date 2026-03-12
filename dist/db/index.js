"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.connectDB = connectDB;
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env");
}
exports.db = new pg_1.Pool({
    connectionString,
});
async function connectDB() {
    try {
        await exports.db.query("SELECT 1");
        console.log("Connected to PostgreSQL");
    }
    catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
}
