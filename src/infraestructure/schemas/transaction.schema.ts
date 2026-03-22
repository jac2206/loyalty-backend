import { z } from "zod"

export const accumulateRequestSchema = z.object({
  documentType: z.string(),
  documentNumber: z.string(),
  partnerCode: z.string(),
  locationCode: z.string().optional(),
  amount: z.number().positive(),
  reference: z.string().min(3)
})

export const accumulateResponseSchema = z.object({
  message: z.string(),
  pointsEarned: z.number(),
  balance: z.number()
})

export const redeemRequestSchema = z.object({
  documentType: z.string(),
  documentNumber: z.string(),
  partnerCode: z.string(),
  locationCode: z.string().optional(),
  points: z.number().positive(),
  reference: z.string().min(3)
})

export const redeemeResponseSchema = z.object({
  message: z.string(),
  pointsRedeemed: z.number(),
  balance: z.number()
})

export const transactionParamsSchema = z.object({
  documentType: z.enum(["CC", "CE", "NIT", "PT"]),
  documentNumber: z.string()
})

export const transactionsQuerySchema = z.object({
  type: z.enum(["ACUM", "REDEM"]).optional()
})

export const transactionItemSchema = z.object({
  id: z.string(),
  type: z.enum(["ACUM", "REDEM"]),
  points: z.number(),
  amount: z.number(),
  partnerCode: z.string(),
  locationCode: z.string(),
  reference: z.string(),
  createdAt: z.string()
})

export const transactionsResponseSchema = z.object({
  transactions: z.array(transactionItemSchema)
})