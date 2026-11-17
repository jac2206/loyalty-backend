import { IRedeemPointsUseCase } from "../../../domain/interfaces/use-cases/transactions/redeem-points.usecase.interface";
import {
  RedeemPointsRequestDTO,
  RedeemPointsResponseDTO,
} from "../../dto/redeem-points.dto";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/transaction.repository.interface";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { assertAccountOwner } from "../../utils/assert-account-owner";

export class RedeemPointsUseCase implements IRedeemPointsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(
    request: RedeemPointsRequestDTO,
    authenticatedDocument: string,
  ): Promise<RedeemPointsResponseDTO> {
    assertAccountOwner(request.documentNumber, authenticatedDocument);
    if (request.points <= 0) {
      const error = DomainErrors.TRANSACTION_POINTS_INVALID;
      throw new DomainException(error.code, error.message, error.statusCode);
    }
    const result = await this.transactionRepository.applyPoints({
      documentType: request.documentType,
      documentNumber: request.documentNumber,
      partnerCode: request.partnerCode,
      locationCode: request.locationCode ?? null,
      type: "REDEM",
      points: request.points,
      amount: request.points * 100,
      reference: request.reference,
    });
    if (result.outcome !== "success") {
      const error =
        result.outcome === "not-found"
          ? DomainErrors.ACCOUNT_NOT_FOUND
          : result.outcome === "inactive"
            ? DomainErrors.ACCOUNT_INACTIVE
            : DomainErrors.INSUFFICIENT_POINTS;
      throw new DomainException(error.code, error.message, error.statusCode);
    }
    return {
      message: "Points redeemed successfully",
      pointsRedeemed: request.points,
      balance: result.balance,
    };
  }
}
