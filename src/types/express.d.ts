import { AwilixContainer } from "awilix";
import { JwtPayload } from "../domain/interfaces/security/jwt-payload.interface";

declare global {
  namespace Express {
    interface Request {
      scope: AwilixContainer;
      user?: JwtPayload;
    }
  }
}

export {};
