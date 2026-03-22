import { z } from "zod"

export const balanceParamsSchema = z.object({
  documentType: z.enum(["CC", "CE", "NIT", "PT"]),
  documentNumber: z.string()
})

export const balanceRsponseSchema =  z.object({
  documentType: z.string(),
  documentNumber: z.string(),
  balance: z.number()
})