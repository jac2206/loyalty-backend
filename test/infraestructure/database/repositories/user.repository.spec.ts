import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../src/infraestructure/database/postgres", () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { pool } from "../../../../src/infraestructure/database/postgres";
import { UserRepository } from "../../../../src/infraestructure/database/repositories/user.repository";
import { User } from "../../../../src/domain/entities/user.entity";

describe("UserRepository", () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
    vi.clearAllMocks();
  });

  it("creates the user and zero-balance active account in one SQL statement", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [
        {
          document_type: "CC",
          document_number: "123",
          full_name: "Ada",
          email: "ada@example.com",
          phone: null,
          password_hash: "hash",
          has_pin: false,
          status: true,
        },
      ],
    } as never);
    await repository.save(
      new User("CC", "123", "Ada", "ada@example.com", null, "hash"),
    );
    const [sql, params] = vi.mocked(pool.query).mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("WITH created_user AS");
    expect(sql).toContain("INSERT INTO loyalty.accounts");
    expect(sql).toContain("SELECT $9, id, 0, true FROM created_user");
    expect(params[8]).toEqual(expect.any(String));
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("propagates an account insertion failure", async () => {
    vi.mocked(pool.query).mockRejectedValueOnce(
      new Error("account insert failed") as never,
    );
    await expect(
      repository.save(new User("CC", "123", "Ada", "ada@example.com", null, "hash")),
    ).rejects.toThrow("account insert failed");
  });

  it("updates only email and full name by document number", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [
        {
          document_type: "CC",
          document_number: "123456789",
          full_name: "Ada Lovelace",
          email: "ada.new@example.com",
          phone: null,
          password_hash: "password-hash",
          has_pin: false,
          status: true,
        },
      ],
    } as never);

    const result = await repository.updateProfile(
      "123456789",
      "ada.new@example.com",
      "Ada Lovelace",
    );

    expect(pool.query).toHaveBeenCalledWith(
      `UPDATE loyalty.users
       SET email = $2, full_name = $3
       WHERE document_number = $1
       RETURNING *`,
      ["123456789", "ada.new@example.com", "Ada Lovelace"],
    );
    expect(result).toEqual(
      new User(
        "CC",
        "123456789",
        "Ada Lovelace",
        "ada.new@example.com",
        null,
        "password-hash",
        false,
        true,
      ),
    );
  });

  it("returns null when the document number does not match a user", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as never);

    const result = await repository.updateProfile(
      "000000000",
      "ada.new@example.com",
      "Ada Lovelace",
    );

    expect(result).toBeNull();
  });
});
