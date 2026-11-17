import { IGetBalanceUseCase } from "../../../domain/interfaces/use-cases/accounts/get-balance.usecase.interface";
import { IAccountRepository } from "../../../domain/interfaces/repositories/account.repository.interface";
import { GetBalanceResponseDTO } from "../../dto/get-balance.dto";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import { assertAccountOwner } from "../../utils/assert-account-owner";

export class GetBalanceUseCase implements IGetBalanceUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {}

  async execute(
    documentType: string,
    documentNumber: string,
    authenticatedDocument: string,
  ): Promise<GetBalanceResponseDTO> {
    assertAccountOwner(documentNumber, authenticatedDocument);
    const balance = await this.accountRepository.getBalanceByDocument(
      documentType,
      documentNumber,
    );

    if (balance === null) {
      const error = DomainErrors.ACCOUNT_NOT_FOUND;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    return {
      documentType,
      documentNumber,
      balance,
    };
  }
}

export { GetBalanceResponseDTO };
