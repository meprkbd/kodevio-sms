import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { ENV } from "./config/env.js";

let server: ReturnType<typeof app.listen>;

// Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  console.error("Shutting down the server due to Uncaught Exception.");
  process.exit(1);
});

const startServer = async () => {
  await connectDB();
  server = app.listen(ENV.PORT, () => {
    console.log(`Server running on port: ${ENV.PORT}`);
  });
};

(async () => {
  try {
    await startServer();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error("Error:", err);
  if (server) {
    server.close(() => {
      console.log("Server closed due to unhandled rejection.");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle Graceful Shutdown
const shutdown = async (signal: NodeJS.Signals) => {
  console.info(`Received ${signal}. Initiating graceful shutdown.`);

  try {
    await mongoose.connection.close();
    console.info("MongoDB connection closed.");
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
  }

  if (server) {
    server.close(() => {
      console.info("Server closed.");
      process.exit(0);
    });

    setTimeout(() => {
      console.warn("Force exiting after 10 seconds.");
      process.exit(1);
    }, 10000);
  }
};

process.on("SIGINT", shutdown); // e.g. Ctrl+C
process.on("SIGTERM", shutdown); // e.g. from Docker or hosting provider
