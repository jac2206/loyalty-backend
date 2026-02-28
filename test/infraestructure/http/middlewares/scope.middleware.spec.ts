import { describe, it, expect, vi, beforeEach } from "vitest";
import { authorizeScopes } from "../../../../src/infraestructure/http/middlewares/scope.middleware";

describe("authorizeScopes middleware", () => {

  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {

    req = {};

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();

    vi.clearAllMocks();
  });

  it("should return 403 when user has no scopes", () => {

    req.user = {};

    const middleware = authorizeScopes(["read"]);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      code: "FORBIDDEN",
      message: "No scopes found"
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when user lacks required scope", () => {

    req.user = {
      scopes: ["write"]
    };

    const middleware = authorizeScopes(["read"]);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: "UNAUTHORIZED ",
      message: "Insufficient permissions"
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should call next when user has required scope", () => {

    req.user = {
      scopes: ["read", "write"]
    };

    const middleware = authorizeScopes(["read"]);

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should call next when any required scope matches", () => {

    req.user = {
      scopes: ["admin"]
    };

    const middleware = authorizeScopes(["read", "admin"]);

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

});