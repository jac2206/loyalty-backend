import { Router } from "express";
import { container } from "../../../../config/container";
import { TransactionsController } from "../../../controllers/v1/transactions.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeScopes } from "../../middlewares/scope.middleware";
import {
  accumulateRequestSchema,
  accumulateResponseSchema,
  redeemeResponseSchema,
  redeemRequestSchema,
  transactionParamsSchema,
  transactionsQuerySchema,
  transactionsResponseSchema,
} from "../../../schemas/transaction.schema";
import { validate } from "../../middlewares/validate.middleware";
import { registry } from "../../../docs/registry";
import { registerRoute } from "../../../docs/route-builder";
import { errorResponseSchema } from "../../../schemas/error.schema";

const router = Router();
const forbiddenResponse = {
  description: "Account is inactive or does not belong to the authenticated user",
  content: { "application/json": { schema: errorResponseSchema } },
};

registerRoute(router, registry, {
  method: "get",
  path: "/:documentType/:documentNumber",
  swaggerPath: "/v1/transactions/{documentType}/{documentNumber}",
  tag: "Transactions",
  paramsSchema: transactionParamsSchema,
  querySchema: transactionsQuerySchema,
  responseSchema: transactionsResponseSchema,
  isProtected: true,
  customResponses: { 403: forbiddenResponse },
  middlewares: [
    validate({ params: transactionParamsSchema }),
    authenticateJWT,
    authorizeScopes(["user"]),
  ],
  handler: async (req, res) => {
    const controller = container.resolve<TransactionsController>(
      "transactionsController",
    );
    return controller.getTransactions(req, res);
  },
});

registerRoute(router, registry, {
  method: "post",
  path: "/accumulate",
  swaggerPath: "/v1/transactions/accumulate",
  tag: "Transactions",
  bodySchema: accumulateRequestSchema,
  responseSchema: accumulateResponseSchema,
  successStatus: 201,
  isProtected: true,
  customResponses: { 403: forbiddenResponse },
  middlewares: [
    validate({ body: accumulateRequestSchema }),
    authenticateJWT,
    authorizeScopes(["user"]),
  ],
  handler: async (req, res) => {
    const controller = container.resolve<TransactionsController>(
      "transactionsController",
    );
    return controller.accumulate(req, res);
  },
});

registerRoute(router, registry, {
  method: "post",
  path: "/redeem",
  swaggerPath: "/v1/transactions/redeem",
  tag: "Transactions",
  bodySchema: redeemRequestSchema,
  responseSchema: redeemeResponseSchema,
  successStatus: 201,
  isProtected: true,
  customResponses: { 403: forbiddenResponse },
  middlewares: [
    validate({ body: redeemRequestSchema }),
    authenticateJWT,
    authorizeScopes(["user"]),
  ],
  handler: async (req, res) => {
    const controller = container.resolve<TransactionsController>(
      "transactionsController",
    );
    return controller.redeem(req, res);
  },
});

export default router;
