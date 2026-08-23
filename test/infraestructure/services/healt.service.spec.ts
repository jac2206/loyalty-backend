import { describe, it, expect } from 'vitest';
import { HealthService } from '../../../src/infraestructure/services/health.service';

describe('GetHelth', () => {
  it('should return a healt entity with expected data', async () => {
    // Arrange
    const healthService = new HealthService();

    // Act
    const result = await healthService.getStatus();

    // Assert
    expect(result).toBeDefined();
    expect(result).toEqual({
      status: 'ok',
    });
  });
});
