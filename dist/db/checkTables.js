"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const index_1 = require("./index");
async function checkTables() {
    try {
        const result = await index_1.db.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
        console.log("Tables:");
        for (const row of result.rows) {
            console.log("-", row.tablename);
        }
    }
    catch (error) {
        console.error("Check failed:", error);
    }
    finally {
        await index_1.db.end();
        process.exit(0);
    }
}
checkTables();
