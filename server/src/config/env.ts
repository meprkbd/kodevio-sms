import "dotenv/config";

function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value!;
}

export const ENV = {
  PORT: getEnv("PORT", false) || "5000",
  NODE_ENV: getEnv("NODE_ENV", false) || "development",

  CLIENT_URL: getEnv("CLIENT_URL", false) || "http://localhost:3000",
  MONGO_URI: getEnv("MONGO_URI"),
};
