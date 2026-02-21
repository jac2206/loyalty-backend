import {
  createContainer,
  asClass,
  InjectionMode
} from "awilix";

import { HealthService } from "../infraestructure/services/health.service";
import { HealthController } from "../infraestructure/controllers/health.controller";
import { GenericController } from "../infraestructure/controllers/v1/generic.controller";
import { GetGenericUseCase } from "../application/use-cases/generic/get-generic.usecase";
import { CreateGenericUseCase } from "../application/use-cases/generic/create-generic.usecase";
import { UpdateGenericUseCase } from "../application/use-cases/generic/update-generic.usecase";
import { WinstonLogger } from "../infraestructure/logger/wiston.logger";

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC
});

container.register({
  // Use cases
  getGenericUseCase: asClass(GetGenericUseCase).scoped(),
  createGenericUseCase: asClass(CreateGenericUseCase).scoped(),
  updateGenericUseCase: asClass(UpdateGenericUseCase).scoped(),

  // Services
  healthService: asClass(HealthService).singleton(),

  // Controllers
  healthController: asClass(HealthController).scoped(),
  genericController: asClass(GenericController).scoped()

  
});

container.register({
  logger: asClass(WinstonLogger).singleton()
});
