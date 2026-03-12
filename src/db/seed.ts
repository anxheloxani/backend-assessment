import dotenv from "dotenv";
dotenv.config();

import { db } from "./index";

async function seed() {
  try {
    const orgResult = await db.query(
      `
      INSERT INTO organizations (name)
      VALUES ($1)
      RETURNING id, name, status
      `,
      ["Acme Inc"]
    );

    const organization = orgResult.rows[0];

    const userResult = await db.query(
      `
      INSERT INTO users (organization_id, name, email, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, organization_id, name, email, role
      `,
      [organization.id, "Admin User", "admin@acme.com", "admin"]
    );

    const adminUser = userResult.rows[0];

    console.log("Seed completed");
    console.log("Organization:", organization);
    console.log("Admin user:", adminUser);
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

seed();