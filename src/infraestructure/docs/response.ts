import { errorResponseSchema } from "../schemas/error.schema"

export const unauthorized = (description = "Unauthorized") => ({
  401: {
    description,
    content: {
      "application/json": {
        schema: errorResponseSchema
      }
    }
  }
})

export const conflict = (description = "Conflict") => ({
  409: {
    description,
    content: {
      "application/json": {
        schema: errorResponseSchema
      }
    }
  }
})

export const notFound = (description = "Not Found") => ({
  404: {
    description,
    content: {
      "application/json": {
        schema: errorResponseSchema
      }
    }
  }
})