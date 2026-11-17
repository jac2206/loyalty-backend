import { AccountResponseDTO } from "../../dto/account.dto";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import { IAccountRepository } from "../../../domain/interfaces/repositories/account.repository.interface";
import { IUpdateAccountStatusUseCase } from "../../../domain/interfaces/use-cases/accounts/update-account-status.usecase.interface";

export class UpdateAccountStatusUseCase implements IUpdateAccountStatusUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {}

  async execute(documentNumber: string, status: boolean): Promise<AccountResponseDTO> {
    const account = await this.accountRepository.updateStatusByDocumentNumber(
      documentNumber,
      status,
    );
    if (!account) {
      const error = DomainErrors.ACCOUNT_NOT_FOUND;
      throw new DomainException(error.code, error.message, error.statusCode);
    }
    const response: AccountResponseDTO = {
      id: account.id,
      userId: account.userId,
      pointsBalance: account.pointsBalance,
      status: account.status,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
    return response;
  }
}
