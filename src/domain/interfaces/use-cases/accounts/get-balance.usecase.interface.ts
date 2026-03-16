import { GetBalanceResponseDTO } from "../../../../application/use-cases/accounts/get-balance.usecase";

export interface IGetBalanceUseCase {
  execute(
    documentType: string,
    documentNumber: string
  ): Promise<GetBalanceResponseDTO>;
}