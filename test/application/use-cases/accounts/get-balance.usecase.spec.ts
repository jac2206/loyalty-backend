import { describe, expect, it, vi } from "vitest";
import { GetBalanceUseCase } from "../../../../src/application/use-cases/accounts/get-balance.usecase";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { IAccountRepository } from "../../../../src/domain/interfaces/repositories/account.repository.interface";

describe("GetBalanceUseCase", () => {
  it("returns the balance for the requested document without mutating it", async () => {
    const accountRepository = {
      getBalanceByDocument: vi.fn().mockResolvedValue(125),
    } as unknown as IAccountRepository;

    await expect(
      new GetBalanceUseCase(accountRepository).execute("CC", "123"),
    ).resolves.toEqual({ documentType: "CC", documentNumber: "123", balance: 125 });
    expect(accountRepository.getBalanceByDocument).toHaveBeenCalledWith("CC", "123");
  });

  it("throws ACCOUNT_NOT_FOUND when no account exists for the document", async () => {
    const accountRepository = {
      getBalanceByDocument: vi.fn().mockResolvedValue(null),
    } as unknown as IAccountRepository;

    await expect(
      new GetBalanceUseCase(accountRepository).execute("CC", "missing"),
    ).rejects.toMatchObject(DomainErrors.ACCOUNT_NOT_FOUND);
  });
});
