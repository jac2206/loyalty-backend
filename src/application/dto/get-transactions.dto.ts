export interface TransactionDTO {
  id: string
  partnerCode: string
  locationCode: string | null
  type: string
  points: number
  amount: number
  reference: string
  createdAt: Date
}

export interface GetTransactionsResponseDTO {
  transactions: TransactionDTO[]
}