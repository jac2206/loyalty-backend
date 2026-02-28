import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../src/infraestructure/logger/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn()
  }
}));

import { errorMiddleware } from "../../../../src/infraestructure/http/middlewares/error.middleware";
import { DomainException } from "../../../../src/domain/exceptions/domain.exception";
import { logger } from "../../../../src/infraestructure/logger/logger";

describe("errorMiddleware", () => {

  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {

    vi.clearAllMocks();

    req = {};

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();
  });

  it("should handle DomainException correctly", () => {

    const domainError = new DomainException(
      "TEST_CODE",
      "Test message",
      400
    );

    errorMiddleware(domainError, req, res, next);

    expect(logger.warn).toHaveBeenCalledWith({
      code: "TEST_CODE",
      message: "Test message"
    });

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      code: "TEST_CODE",
      message: "Test message"
    });
  });

  it("should handle unknown error as 500", () => {

    const genericError = new Error("Something broke");

    errorMiddleware(genericError, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(genericError);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
  });

});