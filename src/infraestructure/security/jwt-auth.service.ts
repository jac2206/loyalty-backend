import jwt from "jsonwebtoken";
import { IAuthService } from "../../domain/interfaces/services/auth.service.interface";
import { JwtPayload } from "../../domain/interfaces/security/jwt-payload.interface";
import { env } from "../../config/env";

export class JwtAuthService implements IAuthService {

  constructor(){}

  generateToken(payload: JwtPayload): string {

    const token = jwt.sign(
      payload,
      env.jwtSecret,
      {
        algorithm: "HS256",
        expiresIn: "1h"
      }
    );

    return token;
  }

  verifyToken(token: string): JwtPayload {

    const decoded = jwt.verify(
      token,
      env.jwtSecret,
      {
        algorithms: ["HS256"]
      }
    ) as JwtPayload;

    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    return decoded;
  }
}