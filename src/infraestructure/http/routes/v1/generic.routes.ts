import { Router } from "express";
import { container } from "../../../../config/container";
import { GenericController } from "../../../controllers/v1/generic.controller";

const router = Router();

router.get("/", async (req, res) => {
  const controller = container.resolve<GenericController>("genericController");
  return controller.getGeneric(req, res);
});
router.post("/", async (req, res) => {
  const controller = container.resolve<GenericController>("genericController");
  return controller.postGeneric(req, res);
});

router.patch("/:id", async (req, res) => {
  const controller = container.resolve<GenericController>("genericController");
  return controller.patchGeneric(req, res);
})

export default router;
