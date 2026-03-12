import dotenv from "dotenv";
dotenv.config();

import { db } from "./index";

async function checkOrganizations() {
  try {
    const result = await db.query(`
      SELECT id, name, status, created_at
      FROM organizations
      ORDER BY created_at DESC
      LIMIT 10;
    `);

    console.log("Organizations:");
    for (const row of result.rows) {
      console.log(row);
    }
  } catch (error) {
    console.error("Check failed:", error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

checkOrganizations();