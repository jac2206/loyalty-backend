import { describe, expect, it, vi } from "vitest";
import { RedeemPointsUseCase } from "../../../../src/application/use-cases/transactions/redeem-points.usecase";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { IAccountRepository } from "../../../../src/domain/interfaces/repositories/account.repository.interface";
import { ITransactionRepository } from "../../../../src/domain/interfaces/repositories/transaction.repository.interface";

describe("RedeemPointsUseCase", () => {
  const request = {
    documentType: "CC",
    documentNumber: "123",
    partnerCode: "SHOP",
    points: 20,
    reference: "redemption-1",
  };

  it("creates a REDEM transaction and subtracts the requested points", async () => {
    const accountRepository = {
      getAccountIdByDocument: vi.fn().mockResolvedValue("account-1"),
      getBalance: vi.fn().mockResolvedValue(30),
      subtractPoints: vi.fn().mockResolvedValue(10),
    } as unknown as IAccountRepository;
    const transactionRepository = {
      save: vi.fn().mockResolvedValue(undefined),
    } as unknown as ITransactionRepository;

    await expect(
      new RedeemPointsUseCase(transactionRepository, accountRepository).execute(
        request,
      ),
    ).resolves.toEqual({
      message: "Points redeemed successfully",
      pointsRedeemed: 20,
      balance: 10,
    });
    expect(transactionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "account-1",
        type: "REDEM",
        points: 20,
        amount: 2_000,
        locationCode: null,
      }),
    );
    expect(accountRepository.subtractPoints).toHaveBeenCalledWith("account-1", 20);
  });

  it("rejects non-positive points before interacting with ports", async () => {
    const accountRepository = {
      getAccountIdByDocument: vi.fn(),
      getBalance: vi.fn(),
      subtractPoints: vi.fn(),
    } as unknown as IAccountRepository;
    const transactionRepository = {
      save: vi.fn(),
    } as unknown as ITransactionRepository;

    await expect(
      new RedeemPointsUseCase(transactionRepository, accountRepository).execute({
        ...request,
        points: 0,
      }),
    ).rejects.toMatchObject(DomainErrors.TRANSACTION_POINTS_INVALID);
    expect(accountRepository.getAccountIdByDocument).not.toHaveBeenCalled();
  });

  it("rejects a missing account without saving a transaction", async () => {
    const accountRepository = {
      getAccountIdByDocument: vi.fn().mockResolvedValue(null),
      getBalance: vi.fn(),
      subtractPoints: vi.fn(),
    } as unknown as IAccountRepository;
    const transactionRepository = {
      save: vi.fn(),
    } as unknown as ITransactionRepository;

    await expect(
      new RedeemPointsUseCase(transactionRepository, accountRepository).execute(
        request,
      ),
    ).rejects.toMatchObject(DomainErrors.ACCOUNT_NOT_FOUND);
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it("rejects insufficient balance without saving a transaction or subtracting points", async () => {
    const accountRepository = {
      getAccountIdByDocument: vi.fn().mockResolvedValue("account-1"),
      getBalance: vi.fn().mockResolvedValue(19),
      subtractPoints: vi.fn(),
    } as unknown as IAccountRepository;
    const transactionRepository = {
      save: vi.fn(),
    } as unknown as ITransactionRepository;

    await expect(
      new RedeemPointsUseCase(transactionRepository, accountRepository).execute(
        request,
      ),
    ).rejects.toMatchObject(DomainErrors.INSUFFICIENT_POINTS);
    expect(transactionRepository.save).not.toHaveBeenCalled();
    expect(accountRepository.subtractPoints).not.toHaveBeenCalled();
  });
});
