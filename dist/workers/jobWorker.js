"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("../db");
async function processJobs() {
    try {
        const result = await db_1.db.query(`SELECT id, job_type, payload FROM job_queue
       WHERE status = 'pending'
       ORDER BY created_at ASC
       LIMIT 10`);
        for (const job of result.rows) {
            console.log(`[worker] Processing job: ${job.job_type}`, job.payload);
            await db_1.db.query(`UPDATE job_queue
         SET status = 'done', processed_at = now(), attempts = attempts + 1
         WHERE id = $1`, [job.id]);
        }
    }
    catch (error) {
        console.error("[worker] Error:", error);
    }
}
setInterval(processJobs, 3000);
console.log("[worker] Job worker started, polling every 3 seconds");
