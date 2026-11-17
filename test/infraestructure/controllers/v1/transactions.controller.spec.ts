import { describe, expect, it, vi } from "vitest";
import { Request, Response } from "express";
import { TransactionsController } from "../../../../src/infraestructure/controllers/v1/transactions.controller";
import { IGetTransactionsUseCase } from "../../../../src/domain/interfaces/use-cases/transactions/get-transactions.usecase.interface";
import { IAccumulatePointsUseCase } from "../../../../src/domain/interfaces/use-cases/transactions/accumulate-points.usecase.interface";
import { IRedeemPointsUseCase } from "../../../../src/domain/interfaces/use-cases/transactions/redeem-points.usecase.interface";

describe("TransactionsController", () => {
  it("passes the authenticated subject to all transaction use cases", async () => {
    const history = { execute: vi.fn().mockResolvedValue({ transactions: [] }) };
    const accumulate = { execute: vi.fn().mockResolvedValue({}) };
    const redeem = { execute: vi.fn().mockResolvedValue({}) };
    const controller = new TransactionsController(
      history as IGetTransactionsUseCase,
      accumulate as IAccumulatePointsUseCase,
      redeem as IRedeemPointsUseCase,
    );
    const req = {
      user: { sub: "owner" },
      params: { documentType: "CC", documentNumber: "other" },
      query: {},
      body: { documentNumber: "other" },
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    await controller.getTransactions(req, res);
    await controller.accumulate(req, res);
    await controller.redeem(req, res);
    expect(history.execute).toHaveBeenCalledWith("CC", "other", undefined, "owner");
    expect(accumulate.execute).toHaveBeenCalledWith(req.body, "owner");
    expect(redeem.execute).toHaveBeenCalledWith(req.body, "owner");
  });
});
