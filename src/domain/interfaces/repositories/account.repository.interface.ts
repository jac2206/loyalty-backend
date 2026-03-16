export interface IAccountRepository {

  getBalanceByDocument(
    documentType: string,
    documentNumber: string
  ): Promise<number | null>;
  getAccountIdByDocument(
    documentType: string,
    documentNumber: string
  ): Promise<string | null>;
  addPoints(
    accountId: string,
    points: number
  ): Promise<number>;
  getBalance(accountId: string): Promise<number>;
  subtractPoints(
    accountId: string,
    points: number
  ): Promise<number>;
}