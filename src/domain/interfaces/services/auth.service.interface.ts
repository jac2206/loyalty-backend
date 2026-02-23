import { JwtPayload } from "../security/jwt-payload.interface";

export interface IAuthService {
  verifyToken(token: string): JwtPayload;
}