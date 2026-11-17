import { describe, expect, it, vi } from "vitest";
import { AccumulatePointsUseCase } from "../../../../src/application/use-cases/transactions/accumulate-points.usecase";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { ITransactionRepository } from "../../../../src/domain/interfaces/repositories/transaction.repository.interface";

describe("AccumulatePointsUseCase", () => {
  const request = {
    documentType: "CC",
    documentNumber: "123",
    partnerCode: "SHOP",
    amount: 2999,
    reference: "purchase",
  };
  it("sends the calculated points to the atomic port", async () => {
    const repository = {
      applyPoints: vi.fn().mockResolvedValue({ outcome: "success", balance: 12 }),
    } as unknown as ITransactionRepository;
    await expect(
      new AccumulatePointsUseCase(repository).execute(request, "123"),
    ).resolves.toEqual({
      message: "Points accumulated successfully",
      pointsEarned: 2,
      balance: 12,
    });
    expect(repository.applyPoints).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ACUM", points: 2, documentNumber: "123" }),
    );
  });
  it.each([
    ["not-found", DomainErrors.ACCOUNT_NOT_FOUND],
    ["inactive", DomainErrors.ACCOUNT_INACTIVE],
  ] as const)("maps %s", async (outcome, expected) => {
    const repository = {
      applyPoints: vi.fn().mockResolvedValue({ outcome }),
    } as unknown as ITransactionRepository;
    await expect(
      new AccumulatePointsUseCase(repository).execute(request, "123"),
    ).rejects.toMatchObject(expected);
  });
  it("rejects another user's document without accessing persistence", async () => {
    const repository = { applyPoints: vi.fn() } as unknown as ITransactionRepository;
    await expect(
      new AccumulatePointsUseCase(repository).execute(request, "other"),
    ).rejects.toMatchObject(DomainErrors.ACCOUNT_DOCUMENT_MISMATCH);
    expect(repository.applyPoints).not.toHaveBeenCalled();
  });
  it("rejects non-positive amounts", async () => {
    const repository = { applyPoints: vi.fn() } as unknown as ITransactionRepository;
    await expect(
      new AccumulatePointsUseCase(repository).execute({ ...request, amount: 0 }, "123"),
    ).rejects.toMatchObject(DomainErrors.TRANSACTION_POINTS_INVALID);
    expect(repository.applyPoints).not.toHaveBeenCalled();
  });
});
