import { Router } from "express";
import { container } from "../../../config/container";
import { HealthController } from "../../controllers/health.controller";
import { registerRoute } from "../../docs/route-builder";
import { healthSchema } from "../../schemas/health.schema";
import { registry } from "../../docs/registry";

const router = Router();

registerRoute(router, registry, {
  method: "get",
  path: "/",
  swaggerPath: "/health",
  tag: "Health",
  responseSchema: healthSchema,
  isProtected: true,
  handler: async (req, res) => {
    const controller = container.resolve<HealthController>("healthController");
    return controller.getHealth(req, res);
  }
})

export default router;
