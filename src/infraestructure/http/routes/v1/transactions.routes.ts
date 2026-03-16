import { Router } from "express"
import { container } from "../../../../config/container"
import { TransactionsController } from "../../../controllers/v1/transactions.controller"
import { authenticateJWT } from "../../middlewares/auth.middleware"
import { authorizeScopes } from "../../middlewares/scope.middleware"

const router = Router()

router.get(
  "/:documentType/:documentNumber",
  authenticateJWT,
  authorizeScopes(["user"]),
  async (req, res) => {
    const controller = container.resolve<TransactionsController>("transactionsController");
    return controller.getTransactions(req, res);
  });

router.post(
  "/accumulate",
  authenticateJWT,
  authorizeScopes(["user"]),
  async (req, res) => {
    const controller = container.resolve<TransactionsController>("transactionsController");
    return controller.accumulate(req, res);
  });

router.post(
  "/redeem",
  authenticateJWT,
  authorizeScopes(["user"]),
  async (req, res) => {
    const controller = container.resolve<TransactionsController>("transactionsController");
    return controller.redeem(req, res);
  }
)

export default router