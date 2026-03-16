import { IGetTransactionsUseCase } from "../../../domain/interfaces/use-cases/transactions/get-transactions.usecase.interface"
import { ITransactionRepository } from "../../../domain/interfaces/repositories/transaction.repository.interface"
import { GetTransactionsResponseDTO } from "../../dto/get-transactions.dto"
import { DomainErrors } from "../../../domain/errors/domain-errors"
import { DomainException } from "../../../domain/exceptions/domain.exception"

export class GetTransactionsUseCase implements IGetTransactionsUseCase {

  constructor(
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(
    documentType: string,
    documentNumber: string,
    type?: string
  ): Promise<GetTransactionsResponseDTO> {

    if (!documentNumber) {
      const error = DomainErrors.USER_DOCUMENT_REQUIRED
      throw new DomainException(error.code, error.message, error.statusCode)
    };

    if (type && !["ACUM", "REDEM"].includes(type)) {
      const error = DomainErrors.TRANSACTION_TYPE_INVALID
      throw new DomainException(error.code, error.message, error.statusCode)
    };

    const transactions =
      await this.transactionRepository.findByUser(
        documentType,
        documentNumber,
        type
      );

    const result: GetTransactionsResponseDTO = {
        transactions: transactions.map(t => ({
            id: t.id as string,
            partnerCode: t.partnerCode,
            locationCode: t.locationCode,
            type: t.type,
            points: t.points,
            amount: t.amount,
            reference: t.reference,
            createdAt: t.createdAt as Date
        }))
    };

    return result;
  };

}