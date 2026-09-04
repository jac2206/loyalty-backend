import { describe, expect, it, vi } from "vitest";
import { AccumulatePointsUseCase } from "../../../../src/application/use-cases/transactions/accumulate-points.usecase";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { IAccountRepository } from "../../../../src/domain/interfaces/repositories/account.repository.interface";
import { ITransactionRepository } from "../../../../src/domain/interfaces/repositories/transaction.repository.interface";

describe("AccumulatePointsUseCase", () => {
  const request = {
    documentType: "CC",
    documentNumber: "123",
    partnerCode: "SHOP",
    amount: 2_999,
    reference: "purchase-1",
  };

  it("creates an ACUM transaction and adds floor(amount / 1000) points", async () => {
    const accountRepository = {
      getAccountIdByDocument: vi.fn().mockResolvedValue("account-1"),
      addPoints: vi.fn().mockResolvedValue(12),
    } as unknown as IAccountRepository;
    const transactionRepository = {
      save: vi.fn().mockResolvedValue(undefined),
    } as unknown as ITransactionRepository;

    await expect(
      new AccumulatePointsUseCase(transactionRepository, accountRepository).execute(
        request,
      ),
    ).resolves.toEqual({
      message: "Points accumulated successfully",
      pointsEarned: 2,
      balance: 12,
    });
    expect(transactionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "account-1",
        type: "ACUM",
        points: 2,
        amount: 2_999,
        locationCode: null,
      }),
    );
    expect(accountRepository.addPoints).toHaveBeenCalledWith("account-1", 2);
  });

  it("rejects a non-positive amount without calling any port", async () => {
    const accountRepository = {
      getAccountIdByDocument: vi.fn(),
      addPoints: vi.fn(),
    } as unknown as IAccountRepository;
    const transactionRepository = {
      save: vi.fn(),
    } as unknown as ITransactionRepository;

    await expect(
      new AccumulatePointsUseCase(transactionRepository, accountRepository).execute({
        ...request,
        amount: 0,
      }),
    ).rejects.toMatchObject(DomainErrors.TRANSACTION_POINTS_INVALID);
    expect(accountRepository.getAccountIdByDocument).not.toHaveBeenCalled();
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it("rejects a missing account without saving a transaction or changing balance", async () => {
    const accountRepository = {
      getAccountIdByDocument: vi.fn().mockResolvedValue(null),
      addPoints: vi.fn(),
    } as unknown as IAccountRepository;
    const transactionRepository = {
      save: vi.fn(),
    } as unknown as ITransactionRepository;

    await expect(
      new AccumulatePointsUseCase(transactionRepository, accountRepository).execute(
        request,
      ),
    ).rejects.toMatchObject(DomainErrors.ACCOUNT_NOT_FOUND);
    expect(transactionRepository.save).not.toHaveBeenCalled();
    expect(accountRepository.addPoints).not.toHaveBeenCalled();
  });
});
