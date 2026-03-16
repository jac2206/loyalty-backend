import { Router } from "express";
import { container } from "../../../../config/container";
import { UsersController } from "../../../controllers/v1/users.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeScopes } from "../../middlewares/scope.middleware";

const router = Router();

router.post("/register", 
  async (req, res) => {
    const controller = container.resolve<UsersController>("usersController");
    return controller.register(req, res);
});

router.post("/login", 
  async (req, res) => {
    const controller = container.resolve<UsersController>("usersController");
    return controller.login(req, res);
});

router.get("/me",
  authenticateJWT,
  authorizeScopes(["user"]),
  async (req, res) => {
    const controller = container.resolve<UsersController>("usersController");
    return controller.getMe(req, res);
});

export default router;