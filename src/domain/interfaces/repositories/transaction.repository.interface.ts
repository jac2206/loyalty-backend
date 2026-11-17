import { Transaction } from "../../../domain/entities/transaction.entity";

export interface ITransactionRepository {
  applyPoints(input: {
    documentType: string;
    documentNumber: string;
    partnerCode: string;
    locationCode: string | null;
    type: "ACUM" | "REDEM";
    points: number;
    amount: number;
    reference: string;
  }): Promise<
    | { outcome: "success"; balance: number }
    | { outcome: "not-found" | "inactive" | "insufficient" }
  >;
  findByUser(
    documentType: string,
    documentNumber: string,
    type?: string,
  ): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
}
