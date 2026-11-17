import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../src/config/container", () => ({
  container: { resolve: vi.fn() },
}));
import "../../../../src/infraestructure/http/routes/v1/transactions.routes";
import { generateSwagger } from "../../../../src/infraestructure/docs/swagger";

describe("Transactions OpenAPI", () => {
  it("documents forbidden responses for history, accumulation and redemption", () => {
    const paths = generateSwagger().paths;
    expect(
      paths["/v1/transactions/{documentType}/{documentNumber}"]?.get?.responses?.[
        "403"
      ],
    ).toBeDefined();
    expect(
      paths["/v1/transactions/accumulate"]?.post?.responses?.["403"],
    ).toBeDefined();
    expect(paths["/v1/transactions/redeem"]?.post?.responses?.["403"]).toBeDefined();
  });

  it("documents the real success status and schema for each transaction route", () => {
    const paths = generateSwagger().paths;
    const accumulation = paths["/v1/transactions/accumulate"]?.post?.responses;
    const redemption = paths["/v1/transactions/redeem"]?.post?.responses;
    const history =
      paths["/v1/transactions/{documentType}/{documentNumber}"]?.get?.responses;
    expect(accumulation?.["201"]).toMatchObject({
      content: {
        "application/json": {
          schema: { properties: { pointsEarned: { type: "number" } } },
        },
      },
    });
    expect(redemption?.["201"]).toMatchObject({
      content: {
        "application/json": {
          schema: { properties: { pointsRedeemed: { type: "number" } } },
        },
      },
    });
    expect(accumulation?.["200"]).toBeUndefined();
    expect(redemption?.["200"]).toBeUndefined();
    expect(history?.["200"]).toBeDefined();
  });
});
