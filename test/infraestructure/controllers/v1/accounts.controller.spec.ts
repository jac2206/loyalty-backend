import { describe, expect, it, vi } from "vitest";
import { Request, Response } from "express";
import { AccountsController } from "../../../../src/infraestructure/controllers/v1/accounts.controller";
import { IGetBalanceUseCase } from "../../../../src/domain/interfaces/use-cases/accounts/get-balance.usecase.interface";
import { IGetAccountUseCase } from "../../../../src/domain/interfaces/use-cases/accounts/get-account.usecase.interface";
import { IUpdateAccountStatusUseCase } from "../../../../src/domain/interfaces/use-cases/accounts/update-account-status.usecase.interface";
import { accountStatusRequestSchema } from "../../../../src/infraestructure/schemas/account.schema";
import { createContainer, asClass, asValue, InjectionMode } from "awilix";
import { GetAccountUseCase } from "../../../../src/application/use-cases/accounts/get-account.usecase";
import { UpdateAccountStatusUseCase } from "../../../../src/application/use-cases/accounts/update-account-status.usecase";

describe("AccountsController", () => {
  it("resolves both account use cases with CLASSIC injection", () => {
    const container = createContainer({ injectionMode: InjectionMode.CLASSIC });
    container.register({
      accountsController: asClass(AccountsController),
      getAccountUseCase: asClass(GetAccountUseCase),
      updateAccountStatusUseCase: asClass(UpdateAccountStatusUseCase),
      getBalanceUseCase: asValue({ execute: vi.fn() }),
      accountRepository: asValue({
        findByDocumentNumber: vi.fn(),
        updateStatusByDocumentNumber: vi.fn(),
      }),
    });
    expect(container.resolve("accountsController")).toBeInstanceOf(AccountsController);
  });
  it("passes the authenticated document to the balance use case", async () => {
    const getBalanceUseCase = {
      execute: vi.fn().mockResolvedValue({ balance: 0 }),
    } as unknown as IGetBalanceUseCase;
    const controller = new AccountsController(
      getBalanceUseCase,
      {} as IGetAccountUseCase,
      {} as IUpdateAccountStatusUseCase,
    );
    const req = {
      params: { documentType: "CC", documentNumber: "other" },
      user: { sub: "owner" },
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    await controller.getBalance(req, res);
    expect(getBalanceUseCase.execute).toHaveBeenCalledWith("CC", "other", "owner");
  });

  it("uses the authenticated subject when changing status", async () => {
    const updateAccountStatusUseCase = {
      execute: vi.fn().mockResolvedValue({ status: false }),
    } as unknown as IUpdateAccountStatusUseCase;
    const controller = new AccountsController(
      {} as IGetBalanceUseCase,
      {} as IGetAccountUseCase,
      updateAccountStatusUseCase,
    );
    const req = {
      user: { sub: "owner" },
      body: { status: false },
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    await controller.updateStatus(req, res);
    expect(updateAccountStatusUseCase.execute).toHaveBeenCalledWith("owner", false);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("accepts only a boolean status without extra fields", () => {
    expect(accountStatusRequestSchema.safeParse({ status: true }).success).toBe(true);
    expect(accountStatusRequestSchema.safeParse({ status: "false" }).success).toBe(
      false,
    );
    expect(
      accountStatusRequestSchema.safeParse({ status: false, pointsBalance: 100 })
        .success,
    ).toBe(false);
  });
});
