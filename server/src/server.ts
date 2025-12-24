import app from "./app.js";
import connectDB from "./config/db.js";
import { ENV } from "./config/env.js";

let server;

const startServer = async () => {
  await connectDB();
  server = app.listen(ENV.PORT, () => {
    console.log(`Server running on port: ${ENV.PORT}`);
  });
};

await startServer();
