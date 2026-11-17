import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../src/infraestructure/database/postgres", () => ({
  pool: { connect: vi.fn() },
}));
import { pool } from "../../../../src/infraestructure/database/postgres";
import { TransactionRepository } from "../../../../src/infraestructure/database/repositories/transaction.repository";

describe("TransactionRepository.applyPoints", () => {
  const input = {
    documentType: "CC",
    documentNumber: "123",
    partnerCode: "SHOP",
    locationCode: null,
    type: "REDEM" as const,
    points: 20,
    amount: 2000,
    reference: "purchase",
  };
  const query = vi.fn();
  const release = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(pool.connect).mockResolvedValue({ query, release } as never);
  });

  it("locks the account and commits the history and balance on the same client", async () => {
    query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: "a", status: true, points_balance: 30 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ points_balance: 10 }] })
      .mockResolvedValueOnce({});
    await expect(new TransactionRepository().applyPoints(input)).resolves.toEqual({
      outcome: "success",
      balance: 10,
    });
    expect(query.mock.calls[0][0]).toBe("BEGIN");
    expect(query.mock.calls[1][0]).toContain("FOR UPDATE OF a");
    expect(query.mock.calls[2][0]).toContain("INSERT INTO loyalty.transactions");
    expect(query.mock.calls[3][0]).toContain("UPDATE loyalty.accounts");
    expect(query.mock.calls[3][1]).toEqual([-20, "a"]);
    expect(query.mock.calls[4][0]).toBe("COMMIT");
    expect(release).toHaveBeenCalledOnce();
  });

  it.each([
    [undefined, "not-found"],
    [{ id: "a", status: false, points_balance: 30 }, "inactive"],
    [{ id: "a", status: null, points_balance: 30 }, "inactive"],
    [{ id: "a", status: true, points_balance: 19 }, "insufficient"],
  ])("rolls back without writing for %s", async (row, outcome) => {
    query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: row ? [row] : [] })
      .mockResolvedValueOnce({});
    await expect(new TransactionRepository().applyPoints(input)).resolves.toEqual({
      outcome,
    });
    expect(query).toHaveBeenCalledTimes(3);
    expect(query.mock.calls[2][0]).toBe("ROLLBACK");
    expect(release).toHaveBeenCalledOnce();
  });

  it("rolls back and releases the connection if the balance update fails", async () => {
    query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: "a", status: true, points_balance: 30 }] })
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("update failed"))
      .mockResolvedValueOnce({});
    await expect(new TransactionRepository().applyPoints(input)).rejects.toThrow(
      "update failed",
    );
    expect(query.mock.calls[4][0]).toBe("ROLLBACK");
    expect(release).toHaveBeenCalledOnce();
  });

  it("rejects when a concurrent deactivation completes before the row lock is acquired", async () => {
    let finishLock!: (value: {
      rows: { id: string; status: boolean; points_balance: number }[];
    }) => void;
    const waitingForLock = new Promise<{
      rows: { id: string; status: boolean; points_balance: number }[];
    }>((resolve) => {
      finishLock = resolve;
    });
    query
      .mockResolvedValueOnce({})
      .mockReturnValueOnce(waitingForLock)
      .mockResolvedValueOnce({});
    const operation = new TransactionRepository().applyPoints(input);
    await vi.waitFor(() => expect(query).toHaveBeenCalledTimes(2));
    finishLock({ rows: [{ id: "a", status: false, points_balance: 30 }] });
    await expect(operation).resolves.toEqual({ outcome: "inactive" });
    expect(query).toHaveBeenCalledTimes(3);
    expect(query.mock.calls[2][0]).toBe("ROLLBACK");
  });
});
