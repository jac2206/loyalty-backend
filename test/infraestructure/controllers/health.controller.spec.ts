import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthController } from "../../../src/infraestructure/controllers/health.controller";
import { IHealthService } from "../../../src/domain/interfaces/services/health.service.interface";

describe("HealthController", () => {

  let healthServiceMock: IHealthService;
  let controller: HealthController;

  beforeEach(() => {

    healthServiceMock = {} as IHealthService;

    controller = new HealthController(healthServiceMock);
  });

  it("should return status ok", async () => {

    const req = {};

    const jsonMock = vi.fn();
    const res = {
      json: jsonMock
    };

    await controller.getHealth(req, res);

    expect(jsonMock).toHaveBeenCalledTimes(1);

    expect(jsonMock).toHaveBeenCalledWith({
      status: "ok"
    });
  });

});