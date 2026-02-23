import { Request, Response, NextFunction } from "express";
import { container } from "../../../config/container";
import { IAuthService } from "../../../domain/interfaces/services/auth.service.interface";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Missing token"
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const authService = container.resolve<IAuthService>("authService");
    const decoded = authService.verifyToken(token);

    (req as any).user = decoded;

    next();
  } catch {
    res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Token invalid or expired"
    });
  }
};