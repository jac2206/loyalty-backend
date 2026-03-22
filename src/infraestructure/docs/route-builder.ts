import { Router, RequestHandler } from "express"
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { ZodTypeAny, ZodObject, ZodRawShape } from "zod"
import { errorResponseSchema } from "../schemas/error.schema"

type RouteConfig = {
  method: "get" | "post" | "patch" | "delete"
  path: string
  swaggerPath: string
  tag: string
  bodySchema?: ZodTypeAny
  paramsSchema?: ZodObject<ZodRawShape>
  querySchema?: ZodObject<ZodRawShape>
  responseSchema?: ZodTypeAny
  handler: RequestHandler
  middlewares?: RequestHandler[]
  customResponses?: Record<number, any>
  isProtected?: boolean 
}

const defaultResponses = {
  400: {
    description: "Bad Request",
    content: {
      "application/json": {
        schema: errorResponseSchema
      }
    }
  },
  401: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: errorResponseSchema
      }
    }
  },
  422: {
    description: "Validation Error",
    content: {
      "application/json": {
        schema: errorResponseSchema
      }
    }
  },
  500: {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: errorResponseSchema
      }
    }
  }
}

export const registerRoute = (
  router: Router,
  registry: OpenAPIRegistry,
  config: RouteConfig
) => {

  const {
    method,
    path,
    swaggerPath,
    tag,
    bodySchema,
    paramsSchema,
    querySchema,
    responseSchema,
    handler,
    middlewares = [],
    customResponses = {},
    isProtected = false 
  } = config

  router[method](path, ...middlewares, handler)

  registry.registerPath({
    method,
    path: swaggerPath,
    tags: [tag],

    request: {
      ...(bodySchema && {
        body: {
          content: {
            "application/json": {
              schema: bodySchema
            }
          }
        }
      }),

      ...(paramsSchema && {
        params: paramsSchema
      }),

      ...(querySchema && {
        query: querySchema
      })
    },

    security: isProtected
      ? [{ bearerAuth: [] }]
      : undefined,

    responses: {
      200: {
        description: "Success",
        content: responseSchema
          ? {
              "application/json": {
                schema: responseSchema
              }
            }
          : undefined
      },

      ...defaultResponses,
      ...customResponses
    }
  })
}