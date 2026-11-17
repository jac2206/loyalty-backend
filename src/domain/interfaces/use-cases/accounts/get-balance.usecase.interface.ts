import { GetBalanceResponseDTO } from "../../../../application/dto/get-balance.dto";

export interface IGetBalanceUseCase {
  execute(
    documentType: string,
    documentNumber: string,
    authenticatedDocument: string,
  ): Promise<GetBalanceResponseDTO>;
}
