import { DomainErrors } from "../../domain/errors/domain-errors";
import { DomainException } from "../../domain/exceptions/domain.exception";

export function assertAccountOwner(
  documentNumber: string,
  authenticatedDocument: string,
): void {
  if (!authenticatedDocument || documentNumber !== authenticatedDocument) {
    const error = DomainErrors.ACCOUNT_DOCUMENT_MISMATCH;
    throw new DomainException(error.code, error.message, error.statusCode);
  }
}
