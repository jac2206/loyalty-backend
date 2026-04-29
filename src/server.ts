import express from "express";
import { scopePerRequest } from "awilix-express";
import { container } from "./config/container";
import v1Routes from "./infraestructure/http/routes/v1";
import healthRouters from "./infraestructure/http/routes/health.routes";
import { errorMiddleware } from "./infraestructure/http/middlewares/error.middleware";
import swaggerUi from "swagger-ui-express"
import { generateSwagger } from "./infraestructure/docs/swagger"
import cors from "cors";

export const createServer = () => {

  const swaggerDoc = generateSwagger()

  swaggerDoc.components = swaggerDoc.components || {}
  swaggerDoc.components.securitySchemes = {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT"
    }
  }

  swaggerDoc.security = [
    {
      bearerAuth: []
    }
  ]

  const prefix = "/loyalty";

  const app = express();

  app.use(cors({
    origin: (origin, callback) => {
      const allowed = ["http://localhost:3000", "http://localhost:4002", "https://loyalty-web-mocha.vercel.app"];

      if (!origin) return callback(null, true);

      if (allowed.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  }));

  app.use(express.json());

  app.use(scopePerRequest(container));

  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
      },
      customSiteTitle: "Loyalty API Docs"
    })
  )
  app.use(`${prefix}/health`, healthRouters);
  app.use(`${prefix}/v1`, v1Routes);

  app.use((req, res) => {
    res.status(404).json({
      message: "Route not found",
      code: 404
    });
  });

  app.use(errorMiddleware);

  return app;
};