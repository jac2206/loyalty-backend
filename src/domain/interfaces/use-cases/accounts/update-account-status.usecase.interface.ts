import { AccountResponseDTO } from "../../../../application/dto/account.dto";

export interface IUpdateAccountStatusUseCase {
  execute(documentNumber: string, status: boolean): Promise<AccountResponseDTO>;
}
