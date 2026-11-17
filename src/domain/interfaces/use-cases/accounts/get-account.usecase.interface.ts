import { AccountResponseDTO } from "../../../../application/dto/account.dto";

export interface IGetAccountUseCase {
  execute(documentNumber: string): Promise<AccountResponseDTO>;
}
