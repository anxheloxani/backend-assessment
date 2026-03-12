"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = require("./app");
const db_1 = require("./db");
const app = (0, app_1.createApp)();
const port = Number(process.env.PORT) || 3000;
async function startServer() {
    try {
        await (0, db_1.connectDB)();
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}
startServer();
