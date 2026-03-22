import { OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import { registry } from "./registry"
import { z } from "zod"

extendZodWithOpenApi(z)

export const generateSwagger = () => {

  const generator = new OpenApiGeneratorV3(registry.definitions)

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Loyalty API",
      version: "1.0.0"
    },

    servers: [
      {
        url: "http://localhost:3000/loyalty"
      },
      {
        url: "https://loyalty-backend-production-545b.up.railway.app"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }

  } as any) 
}