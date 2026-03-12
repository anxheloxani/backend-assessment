import dotenv from "dotenv";
dotenv.config();

import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { db } from "./index";

async function runMigration() {
  try {
    const dir = join(process.cwd(), "src", "db", "migrations");
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .filter((f) => f !== "001_init.sql");

    for (const file of files) {
      const filePath = join(dir, file);
      const sql = readFileSync(filePath, "utf8");
      if (!sql.trim()) continue;

      console.log("Running migration:", file);
      await db.query(sql);
    }

    console.log("Migrations ran successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
    process.exit();
  }
}

runMigration();