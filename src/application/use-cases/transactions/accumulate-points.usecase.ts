import { IAccumulatePointsUseCase } from "../../../domain/interfaces/use-cases/transactions/accumulate-points.usecase.interface"
import { AccumulatePointsRequestDTO, AccumulatePointsResponseDTO } from "../../dto/accumulate-points.dto"
import { ITransactionRepository } from "../../../domain/interfaces/repositories/transaction.repository.interface"
import { IAccountRepository } from "../../../domain/interfaces/repositories/account.repository.interface"
import { Transaction } from "../../../domain/entities/transaction.entity"
import { DomainException } from "../../../domain/exceptions/domain.exception"
import { DomainErrors } from "../../../domain/errors/domain-errors"

export class AccumulatePointsUseCase implements IAccumulatePointsUseCase {

  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(
    request: AccumulatePointsRequestDTO
  ): Promise<AccumulatePointsResponseDTO> {

    if (request.amount <= 0) {
      const error = DomainErrors.TRANSACTION_POINTS_INVALID
      throw new DomainException(error.code, error.message, error.statusCode)
    };

    const accountId =
      await this.accountRepository.getAccountIdByDocument(
        request.documentType,
        request.documentNumber
      );

    if (!accountId) {
      const error = DomainErrors.ACCOUNT_NOT_FOUND
      throw new DomainException(error.code, error.message, error.statusCode)
    };

    const points = Math.floor(request.amount / 1000);

    const transaction = new Transaction(
      null,
      accountId,
      request.partnerCode,
      request.locationCode ?? null,
      "ACUM",
      points,
      request.amount,
      request.reference
    );

    await this.transactionRepository.save(transaction);

    const balance = await this.accountRepository.addPoints(accountId, points);

    const result: AccumulatePointsResponseDTO = {
        message: "Points accumulated successfully",
        pointsEarned: points,
        balance: balance
    };

    return result;

  };

}