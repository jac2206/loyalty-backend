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
  jwtSecret: process.env.JWT_SECRET || "secret",

  dataBase: {
    dataBaseUrl: process.env.DATABASE_URL
  }
};