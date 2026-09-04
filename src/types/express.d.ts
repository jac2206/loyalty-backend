import { AwilixContainer } from "awilix";

declare global {
  namespace Express {
    interface Request {
      scope: AwilixContainer;
    }
  }
}

export {};
