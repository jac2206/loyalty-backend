import { IHealthService } from "../../domain/interfaces/services/health.service.interface";

export class HealthService implements IHealthService {
  constructor() {}

  async getStatus() {
    return { status: "ok" };
  }
}
