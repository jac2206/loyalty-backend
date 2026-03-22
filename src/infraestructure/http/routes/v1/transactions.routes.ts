import { Router } from "express"
import { container } from "../../../../config/container"
import { TransactionsController } from "../../../controllers/v1/transactions.controller"
import { authenticateJWT } from "../../middlewares/auth.middleware"
import { authorizeScopes } from "../../middlewares/scope.middleware"
import { accumulateRequestSchema, accumulateResponseSchema, redeemeResponseSchema, redeemRequestSchema, transactionParamsSchema, transactionsQuerySchema, transactionsResponseSchema } from "../../../schemas/transaction.schema"
import { validate } from "../../middlewares/validate.middleware"
import { registry } from "../../../docs/registry"
import { registerRoute } from "../../../docs/route-builder"

const router = Router()

registerRoute(router, registry, {
  method: "get",
  path: "/:documentType/:documentNumber",
  swaggerPath: "/v1/transactions/{documentType}/{documentNumber}",
  tag: "Transactions",
  paramsSchema: transactionParamsSchema,
  querySchema: transactionsQuerySchema,
  responseSchema: transactionsResponseSchema,
  isProtected: true,
  middlewares: [
    validate({params: transactionParamsSchema}),
    authenticateJWT,
    authorizeScopes(["user"])
  ],
  handler: async (req, res) => {
    const controller = container.resolve<TransactionsController>("transactionsController");
    return controller.getTransactions(req, res);
  }
})

registerRoute(router, registry, {
  method: "post",
  path: "/accumulate",
  swaggerPath: "/v1/transactions/accumulate",
  tag: "Transactions",
  bodySchema: accumulateRequestSchema,
  responseSchema: accumulateResponseSchema,
  isProtected: true,
  middlewares: [
    validate({body:accumulateRequestSchema}),
    authenticateJWT,
    authorizeScopes(["user"])
  ],
  handler: async (req, res) => {
    const controller = container.resolve<TransactionsController>("transactionsController");
    return controller.accumulate(req, res);
  }
})

registerRoute(router, registry, {
  method: "post",
  path: "/redeem",
  swaggerPath: "/v1/transactions/redeem",
  tag: "Transactions",
  bodySchema: redeemRequestSchema,
  responseSchema: redeemeResponseSchema,
  isProtected: true,
  middlewares: [
    validate({body:redeemRequestSchema}),
    authenticateJWT,
    authorizeScopes(["user"])
  ],
  handler: async (req, res) => {
    const controller = container.resolve<TransactionsController>("transactionsController");
    return controller.redeem(req, res);
  }
})

export default router