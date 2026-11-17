export interface AccountRecord {
  id: string;
  userId: string;
  pointsBalance: number;
  status: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IAccountRepository {
  findByDocumentNumber(documentNumber: string): Promise<AccountRecord | null>;
  updateStatusByDocumentNumber(
    documentNumber: string,
    status: boolean,
  ): Promise<AccountRecord | null>;
  getBalanceByDocument(
    documentType: string,
    documentNumber: string,
  ): Promise<number | null>;
  getAccountIdByDocument(
    documentType: string,
    documentNumber: string,
  ): Promise<string | null>;
  addPoints(accountId: string, points: number): Promise<number>;
  getBalance(accountId: string): Promise<number>;
  subtractPoints(accountId: string, points: number): Promise<number>;
}
