import { describe, expect, it, vi } from "vitest";
import { RedeemPointsUseCase } from "../../../../src/application/use-cases/transactions/redeem-points.usecase";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { ITransactionRepository } from "../../../../src/domain/interfaces/repositories/transaction.repository.interface";

describe("RedeemPointsUseCase", () => {
  const request = {
    documentType: "CC",
    documentNumber: "123",
    partnerCode: "SHOP",
    points: 20,
    reference: "redemption",
  };
  it("sends redemption to the atomic port", async () => {
    const repository = {
      applyPoints: vi.fn().mockResolvedValue({ outcome: "success", balance: 10 }),
    } as unknown as ITransactionRepository;
    await expect(
      new RedeemPointsUseCase(repository).execute(request, "123"),
    ).resolves.toEqual({
      message: "Points redeemed successfully",
      pointsRedeemed: 20,
      balance: 10,
    });
    expect(repository.applyPoints).toHaveBeenCalledWith(
      expect.objectContaining({ type: "REDEM", points: 20, amount: 2000 }),
    );
  });
  it.each([
    ["not-found", DomainErrors.ACCOUNT_NOT_FOUND],
    ["inactive", DomainErrors.ACCOUNT_INACTIVE],
    ["insufficient", DomainErrors.INSUFFICIENT_POINTS],
  ] as const)("maps %s", async (outcome, expected) => {
    const repository = {
      applyPoints: vi.fn().mockResolvedValue({ outcome }),
    } as unknown as ITransactionRepository;
    await expect(
      new RedeemPointsUseCase(repository).execute(request, "123"),
    ).rejects.toMatchObject(expected);
  });
  it("rejects another user's document without accessing persistence", async () => {
    const repository = { applyPoints: vi.fn() } as unknown as ITransactionRepository;
    await expect(
      new RedeemPointsUseCase(repository).execute(request, "other"),
    ).rejects.toMatchObject(DomainErrors.ACCOUNT_DOCUMENT_MISMATCH);
    expect(repository.applyPoints).not.toHaveBeenCalled();
  });
  it("rejects non-positive points", async () => {
    const repository = { applyPoints: vi.fn() } as unknown as ITransactionRepository;
    await expect(
      new RedeemPointsUseCase(repository).execute({ ...request, points: 0 }, "123"),
    ).rejects.toMatchObject(DomainErrors.TRANSACTION_POINTS_INVALID);
    expect(repository.applyPoints).not.toHaveBeenCalled();
  });
});
