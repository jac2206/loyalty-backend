export interface IHealthService {
  getStatus(): Promise<{ status: string }>;
}
