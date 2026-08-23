import { IHealthService } from '../../domain/interfaces/services/health.service.interface';

export class HealthController {
  constructor(private readonly healthService: IHealthService) {}

  getHealth = async (_req: any, res: any) => {
    res.json({ status: 'ok' });
  };
}
