import { Request, Response, NextFunction } from "express"
import { ZodSchema } from "zod"

type Schema = {
  body?: ZodSchema<any>
  params?: ZodSchema<any>
  query?: ZodSchema<any>
}

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {

    if (schema.body) {
      const result = schema.body.safeParse(req.body)
      if (!result.success) {
        return res.status(422).json({
          code: "VALIDATION_ERROR",
          message: "Invalid body",
          errors: result.error.issues
        })
      }
      req.body = result.data
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params)
      if (!result.success) {
        return res.status(422).json({
          code: "VALIDATION_ERROR",
          message: "Invalid params",
          errors: result.error.issues
        })
      }
      req.params = result.data
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query)
      if (!result.success) {
        return res.status(422).json({
          code: "VALIDATION_ERROR",
          message: "Invalid query",
          errors: result.error.issues
        })
      }
      req.query = result.data
    }

    next()
  }
}