import { Request, Response, NextFunction } from "express";

export const authorizeScopes = (requiredScopes: string[]) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {

    const user = (req as any).user;

    if (!user?.scopes) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "No scopes found"
      });
      return;
    }

    const hasScope = requiredScopes.some(scope =>
      user.scopes.includes(scope)
    );

    if (!hasScope) {
      res.status(401).json({
        code: "UNAUTHORIZED ",
        message: "Insufficient permissions"
      });
      return;
    }

    next();
  };