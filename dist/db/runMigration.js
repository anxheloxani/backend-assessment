"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fs_1 = require("fs");
const path_1 = require("path");
const index_1 = require("./index");
async function runMigration() {
    try {
        const dir = (0, path_1.join)(process.cwd(), "src", "db", "migrations");
        const files = (0, fs_1.readdirSync)(dir)
            .filter((f) => f.endsWith(".sql"))
            .sort()
            .filter((f) => f !== "001_init.sql");
        for (const file of files) {
            const filePath = (0, path_1.join)(dir, file);
            const sql = (0, fs_1.readFileSync)(filePath, "utf8");
            if (!sql.trim())
                continue;
            console.log("Running migration:", file);
            await index_1.db.query(sql);
        }
        console.log("Migrations ran successfully");
    }
    catch (error) {
        console.error("Migration failed:", error);
        process.exitCode = 1;
    }
    finally {
        await index_1.db.end();
        process.exit();
    }
}
runMigration();
