import mongoose from "mongoose";
import { ENV } from "./env.js";

const connectDB = async () => {
  await mongoose
    .connect(ENV.MONGO_URI)
    .then((data) => {
      console.log(`Database connected to: ${data.connection.host}`);
    })
    .catch((err) => {
      console.error(`Database connection error: ${err.message}`);
      mongoose.disconnect();
      process.exit(1);
    });
};

export default connectDB;
