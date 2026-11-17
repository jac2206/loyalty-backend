import { describe, expect, it, vi } from "vitest";
import { GetAccountUseCase } from "../../../../src/application/use-cases/accounts/get-account.usecase";
import { UpdateAccountStatusUseCase } from "../../../../src/application/use-cases/accounts/update-account-status.usecase";
import { IAccountRepository } from "../../../../src/domain/interfaces/repositories/account.repository.interface";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";

describe("Account use cases", () => {
  it("retrieves the account for the authenticated document", async () => {
    const account = {
      id: "account",
      userId: "user",
      status: true,
      pointsBalance: 10,
      createdAt: null,
      updatedAt: null,
    };
    const repository = {
      findByDocumentNumber: vi
        .fn()
        .mockResolvedValue({ ...account, internalField: "private" }),
    } as unknown as IAccountRepository;
    await expect(new GetAccountUseCase(repository).execute("123")).resolves.toEqual(
      account,
    );
    expect(repository.findByDocumentNumber).toHaveBeenCalledWith("123");
  });

  it("updates the status of the authenticated account", async () => {
    const account = {
      id: "account",
      userId: "user",
      status: false,
      pointsBalance: 10,
      createdAt: null,
      updatedAt: null,
    };
    const repository = {
      updateStatusByDocumentNumber: vi.fn().mockResolvedValue(account),
    } as unknown as IAccountRepository;
    await expect(
      new UpdateAccountStatusUseCase(repository).execute("123", false),
    ).resolves.toEqual(account);
    expect(repository.updateStatusByDocumentNumber).toHaveBeenCalledWith("123", false);
  });

  it("reports a missing account on read and update", async () => {
    const repository = {
      findByDocumentNumber: vi.fn().mockResolvedValue(null),
      updateStatusByDocumentNumber: vi.fn().mockResolvedValue(null),
    } as unknown as IAccountRepository;
    await expect(
      new GetAccountUseCase(repository).execute("123"),
    ).rejects.toMatchObject(DomainErrors.ACCOUNT_NOT_FOUND);
    await expect(
      new UpdateAccountStatusUseCase(repository).execute("123", true),
    ).rejects.toMatchObject(DomainErrors.ACCOUNT_NOT_FOUND);
  });
});
