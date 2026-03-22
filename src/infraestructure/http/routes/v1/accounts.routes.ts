import { Router } from "express";
import { container } from "../../../../config/container";
import { AccountsController } from "../../../controllers/v1/accounts.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeScopes } from "../../middlewares/scope.middleware";
import { registerRoute } from "../../../docs/route-builder";
import { registry } from "../../../docs/registry";
import { balanceParamsSchema, balanceRsponseSchema } from "../../../schemas/account.schema";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

registerRoute(router, registry, {
  method: "get",
  path: "/balance/:documentType/:documentNumber",
  swaggerPath: "/v1/accounts/balance/{documentType}/{documentNumber}",
  tag: "Accounts",
  paramsSchema: balanceParamsSchema,
  responseSchema: balanceRsponseSchema,
  isProtected: true,
  middlewares: [
    validate({params: balanceParamsSchema}),
    authenticateJWT,
    authorizeScopes(["user"])
  ],
  handler: async (req, res) => {
    const controller = container.resolve<AccountsController>("accountsController");
    return controller.getBalance(req, res);
  }
})

export default router;