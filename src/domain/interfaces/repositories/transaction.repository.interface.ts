import { Transaction } from "../../../domain/entities/transaction.entity"

export interface ITransactionRepository {

  findByUser(
    documentType: string,
    documentNumber: string,
    type?: string
  ): Promise<Transaction[]>
  save(transaction: Transaction): Promise<void>
}