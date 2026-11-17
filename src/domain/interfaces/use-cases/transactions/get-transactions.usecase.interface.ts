import { GetTransactionsResponseDTO } from "../../../../application/dto/get-transactions.dto";

export interface IGetTransactionsUseCase {
  execute(
    documentType: string,
    documentNumber: string,
    type: string | undefined,
    authenticatedDocument: string,
  ): Promise<GetTransactionsResponseDTO>;
}
