import { GetTransactionsResponseDTO } from "../../../../application/dto/get-transactions.dto"

export interface IGetTransactionsUseCase {

  execute(
    documentType: string,
    documentNumber: string,
    type?: string
  ): Promise<GetTransactionsResponseDTO>

}