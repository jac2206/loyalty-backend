import { Router } from "express";
import { container } from "../../../../config/container";
import { AccountsController } from "../../../controllers/v1/accounts.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeScopes } from "../../middlewares/scope.middleware";

const router = Router();

router.get(
  "/balance/:documentType/:documentNumber",
  authenticateJWT,
  authorizeScopes(["user"]),
  async (req, res) => {
    const controller = container.resolve<AccountsController>("accountsController");
    return controller.getBalance(req, res);
  });

export default router;