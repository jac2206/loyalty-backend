import dotenv from "dotenv";
import packageJson from "../../package.json";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  appName: packageJson.name,
  appVersion: packageJson.version,
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  showEnv: process.env.SHOW_ENV === "true",
  logLevel: process.env.LOG_LEVEL || "info",

  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME
  }
};