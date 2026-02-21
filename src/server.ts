import express from "express";
import { scopePerRequest } from "awilix-express";
import { container } from "./config/container";
import v1Routes from "./infraestructure/http/routes/v1";
import healthRouters from "./infraestructure/http/routes/health.routes";
import { errorMiddleware } from "./infraestructure/http/middleware/error.middleware";

export const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use(scopePerRequest(container));

  app.use("/", healthRouters);
  app.use("/v1", v1Routes);

  app.use((req, res) => {
    res.status(404).json({
      message: "Route not found",
      code: 404
    });
  });

  app.use(errorMiddleware);

  return app;
};
