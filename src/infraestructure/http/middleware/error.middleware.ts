import { Request, Response, NextFunction } from "express";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import { logger } from "../../logger/logger";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {

  if (err instanceof DomainException) {
    logger.warn({
      code: err.code,
      message: err.message
    });

    res.status(err.statusCode).json({
      code: err.code,
      message: err.message
    });

    return;
  }

  logger.error(err);

  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error"
  });
};