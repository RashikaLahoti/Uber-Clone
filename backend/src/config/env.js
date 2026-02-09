import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["PORT", "AUTHOR_NAME", "MONGO_URI", "JWT_SECRET","EXPIRES_IN_JWT"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable ${envVar}`);
    throw new Error(`Missing required environment variable ${envVar}`);
  }
});

export const env ={
    PORT: process.env.PORT,
    AUTHOR_NAME: process.env.AUTHOR_NAME,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EXPIRES_IN_JWT: process.env.EXPIRES_IN_JWT
}
