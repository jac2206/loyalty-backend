import { Router } from "express";
import { container } from "../../../../config/container";
import { UsersController } from "../../../controllers/v1/users.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeScopes } from "../../middlewares/scope.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { getUsersResonseSchema, 
  loginUserRequestSchema, 
  loginUserResponseSchema, 
  meUserResponseSchema, 
  registerUserRequestSchema, 
  registerUserResponseSchema } from "../../../schemas/user.schema";
import { registerRoute } from "../../../docs/route-builder";
import { registry } from "../../../docs/registry";

const router = Router();

registerRoute(router, registry, {
  method: "get",
  path: "/",
  swaggerPath: "/v1/users",
  tag: "Users",
  responseSchema: getUsersResonseSchema,
  middlewares: [authenticateJWT,
    authorizeScopes(["user"])
  ],
  isProtected: true,
  handler: async (req, res) => {
    const controller = container.resolve<UsersController>("usersController");
    return controller.getUsers(req, res);}
});

registerRoute(router, registry, {
  method: "post",
  path: "/register",
  swaggerPath: "/v1/users/register",
  tag: "Users",
  bodySchema: registerUserRequestSchema,
  responseSchema: registerUserResponseSchema,
  isProtected: false,
  middlewares: [validate({body:registerUserRequestSchema})],
  handler: async (req, res) => {
    const controller = container.resolve<UsersController>("usersController");
    return controller.register(req, res)
  }
})

registerRoute(router, registry, {
  method: "post",
  path: "/login",
  swaggerPath: "/v1/users/login",
  tag: "Users",
  bodySchema: loginUserRequestSchema,
  responseSchema: loginUserResponseSchema,
  isProtected: false,
  middlewares: [validate({body:loginUserRequestSchema})],
  handler: async (req, res) => {
    const controller = container.resolve<UsersController>("usersController");
    return controller.login(req, res)
  }
})

registerRoute(router, registry, {
  method: "get",
  path: "/me",
  swaggerPath: "/v1/users/me",
  tag: "Users",
  responseSchema: meUserResponseSchema,
  isProtected: true,
  middlewares: [authenticateJWT,
    authorizeScopes(["user"])
  ],
  handler: async (req, res) => {
    const controller = container.resolve<UsersController>("usersController");
    return controller.getMe(req, res)
  }
})

export default router;