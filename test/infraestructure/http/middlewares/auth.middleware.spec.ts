import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../src/config/container", () => ({
  container: {
    resolve: vi.fn()
  }
}));

import { authenticateJWT } from "../../../../src/infraestructure/http/middlewares/auth.middleware";
import { container } from "../../../../src/config/container";

describe("authenticateJWT middleware", () => {

  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      headers: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();


  });

  it("should return 401 when token is missing", () => {

    authenticateJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: "UNAUTHORIZED",
      message: "Missing token"
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when authorization header is invalid", () => {

    req.headers.authorization = "Invalid token";

    authenticateJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: "UNAUTHORIZED",
      message: "Missing token"
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should call next and attach user when token is valid", () => {

    const fakeDecoded = { id: "123", email: "test@test.com" };

    req.headers.authorization = "Bearer validToken";

    (container.resolve as any).mockReturnValue({
      verifyToken: vi.fn().mockReturnValue(fakeDecoded)
    });

    authenticateJWT(req, res, next);

    expect(container.resolve).toHaveBeenCalledWith("authService");
    expect(req.user).toEqual(fakeDecoded);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return 401 when token is invalid", () => {

    req.headers.authorization = "Bearer invalidToken";

    (container.resolve as any).mockReturnValue({
      verifyToken: vi.fn().mockImplementation(() => {
        throw new Error("Invalid");
      })
    });

    authenticateJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: "INVALID_TOKEN",
      message: "Token invalid or expired"
    });

    expect(next).not.toHaveBeenCalled();
  });

});