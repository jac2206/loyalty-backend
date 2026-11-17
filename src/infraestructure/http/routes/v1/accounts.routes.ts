import { Router } from "express";
import { container } from "../../../../config/container";
import { AccountsController } from "../../../controllers/v1/accounts.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeScopes } from "../../middlewares/scope.middleware";
import { registerRoute } from "../../../docs/route-builder";
import { registry } from "../../../docs/registry";
import {
  balanceParamsSchema,
  balanceRsponseSchema,
  accountResponseSchema,
  accountStatusRequestSchema,
} from "../../../schemas/account.schema";
import { validate } from "../../middlewares/validate.middleware";
import { errorResponseSchema } from "../../../schemas/error.schema";

const router = Router();
const accountNotFound = {
  description: "Account not found",
  content: { "application/json": { schema: errorResponseSchema } },
};
const accountForbidden = {
  description: "The account does not belong to the authenticated user",
  content: { "application/json": { schema: errorResponseSchema } },
};

registerRoute(router, registry, {
  method: "get",
  path: "/me",
  swaggerPath: "/v1/accounts/me",
  tag: "Accounts",
  responseSchema: accountResponseSchema,
  isProtected: true,
  customResponses: { 404: accountNotFound },
  middlewares: [authenticateJWT, authorizeScopes(["user"])],
  handler: async (req, res) =>
    container.resolve<AccountsController>("accountsController").getMe(req, res),
});

registerRoute(router, registry, {
  method: "patch",
  path: "/me/status",
  swaggerPath: "/v1/accounts/me/status",
  tag: "Accounts",
  bodySchema: accountStatusRequestSchema,
  responseSchema: accountResponseSchema,
  isProtected: true,
  customResponses: { 404: accountNotFound },
  middlewares: [
    authenticateJWT,
    authorizeScopes(["user"]),
    validate({ body: accountStatusRequestSchema }),
  ],
  handler: async (req, res) =>
    container.resolve<AccountsController>("accountsController").updateStatus(req, res),
});

registerRoute(router, registry, {
  method: "get",
  path: "/balance/:documentType/:documentNumber",
  swaggerPath: "/v1/accounts/balance/{documentType}/{documentNumber}",
  tag: "Accounts",
  paramsSchema: balanceParamsSchema,
  responseSchema: balanceRsponseSchema,
  isProtected: true,
  customResponses: { 403: accountForbidden, 404: accountNotFound },
  middlewares: [
    validate({ params: balanceParamsSchema }),
    authenticateJWT,
    authorizeScopes(["user"]),
  ],
  handler: async (req, res) => {
    const controller = container.resolve<AccountsController>("accountsController");
    return controller.getBalance(req, res);
  },
});

export default router;
