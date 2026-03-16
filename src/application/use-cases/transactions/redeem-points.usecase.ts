import { IRedeemPointsUseCase } from "../../../domain/interfaces/use-cases/transactions/redeem-points.usecase.interface"
import { RedeemPointsRequestDTO, RedeemPointsResponseDTO } from "../../dto//redeem-points.dto"
import { ITransactionRepository } from "../../../domain/interfaces/repositories/transaction.repository.interface"
import { IAccountRepository } from "../../../domain/interfaces/repositories/account.repository.interface"
import { Transaction } from "../../../domain/entities/transaction.entity"
import { DomainErrors } from "../../../domain/errors/domain-errors"
import { DomainException } from "../../../domain/exceptions/domain.exception"

export class RedeemPointsUseCase implements IRedeemPointsUseCase {

  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(
    request: RedeemPointsRequestDTO
  ): Promise<RedeemPointsResponseDTO> {

    if (request.points <= 0) {
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

    const balance =
      await this.accountRepository.getBalance(accountId);

    if (balance < request.points) {
      const error = DomainErrors.INSUFFICIENT_POINTS
      throw new DomainException(error.code, error.message, error.statusCode)
    };

    const amount = request.points * 100;

    const transaction = new Transaction(
      null,
      accountId,
      request.partnerCode,
      request.locationCode ?? null,
      "REDEM",
      request.points,
      amount,
      request.reference
    );

    await this.transactionRepository.save(transaction);

    const newBalance =
      await this.accountRepository.subtractPoints(
        accountId,
        request.points
      );

    const result: RedeemPointsResponseDTO = {
      message: "Points redeemed successfully",
      pointsRedeemed: request.points,
      balance: newBalance
    };

    return result;
  };

}