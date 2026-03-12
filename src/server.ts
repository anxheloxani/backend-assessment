import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { connectDB } from "./db";

const app = createApp();
const port = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();