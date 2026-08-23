import { describe, expect, it, vi } from "vitest";
import { GetTransactionsUseCase } from "../../../../src/application/use-cases/transactions/get-transactions.usecase";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { ITransactionRepository } from "../../../../src/domain/interfaces/repositories/transaction.repository.interface";
import { Transaction } from "../../../../src/domain/entities/transaction.entity";

describe("GetTransactionsUseCase", () => {
  it("maps the transaction history and forwards the optional type filter", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const transactionRepository = { findByUser: vi.fn().mockResolvedValue([new Transaction("tx-1", "account-1", "SHOP", null, "ACUM", 3, 3_000, "purchase-1", createdAt)]) } as unknown as ITransactionRepository;

    await expect(new GetTransactionsUseCase(transactionRepository).execute("CC", "123", "ACUM")).resolves.toEqual({ transactions: [{ id: "tx-1", partnerCode: "SHOP", locationCode: null, type: "ACUM", points: 3, amount: 3_000, reference: "purchase-1", createdAt }] });
    expect(transactionRepository.findByUser).toHaveBeenCalledWith("CC", "123", "ACUM");
  });

  it("rejects an empty document number without querying history", async () => {
    const transactionRepository = { findByUser: vi.fn() } as unknown as ITransactionRepository;

    await expect(new GetTransactionsUseCase(transactionRepository).execute("CC", "")).rejects.toMatchObject(DomainErrors.USER_DOCUMENT_REQUIRED);
    expect(transactionRepository.findByUser).not.toHaveBeenCalled();
  });

  it("rejects an unsupported type without querying history", async () => {
    const transactionRepository = { findByUser: vi.fn() } as unknown as ITransactionRepository;

    await expect(new GetTransactionsUseCase(transactionRepository).execute("CC", "123", "OTHER")).rejects.toMatchObject(DomainErrors.TRANSACTION_TYPE_INVALID);
    expect(transactionRepository.findByUser).not.toHaveBeenCalled();
  });
});
