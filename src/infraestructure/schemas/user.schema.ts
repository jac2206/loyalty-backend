import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"

extendZodWithOpenApi(z)

export const registerUserRequestSchema = z.object({
  documentType: z.string().min(2),
  documentNumber: z.string().min(5),
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string()
    // .min(8)
    // .regex(/[A-Z]/, "Must contain uppercase")
    // .regex(/[0-9]/, "Must contain number")
}).openapi({
  example: {
    documentType: "CC",
    documentNumber: "1037630472",
    fullName: "Julian Arango",
    email: "julian@email.com",
    phone: "3117468187",
    password: "Password1"
  }
})

export const registerUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  message: z.string()
})

export const loginUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export const loginUserResponseSchema = z.object({
  token: z.string()
})

export const meUserResponseSchema = z.object({
  documentType: z.string(),
  documentNumber: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
})

export const getUsersResonseSchema = z.object({
  documentType: z.string(),
  documentNumber: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  hasPin: z.boolean(),
  status: z.boolean()
})