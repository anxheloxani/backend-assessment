import dotenv from "dotenv";
dotenv.config();

import { db } from "./index";

async function checkTables() {
  try {
    const result = await db.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log("Tables:");
    for (const row of result.rows) {
      console.log("-", row.tablename);
    }
  } catch (error) {
    console.error("Check failed:", error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

checkTables();