import { z } from "zod";

export const accountStatusRequestSchema = z.object({ status: z.boolean() }).strict();
export const accountResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  pointsBalance: z.number().int(),
  status: z.boolean().nullable(),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});

export const balanceParamsSchema = z.object({
  documentType: z.enum(["CC", "CE", "NIT", "PT"]),
  documentNumber: z.string(),
});

export const balanceRsponseSchema = z.object({
  documentType: z.string(),
  documentNumber: z.string(),
  balance: z.number(),
});
