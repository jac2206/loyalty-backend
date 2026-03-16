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
import { JwtAuthService } from "../infraestructure/security/jwt-auth.service";
import { GenericRepository } from "../infraestructure/database/repositories/generic.repository";
import { GetXIdGenericUseCase } from "../application/use-cases/generic/getxid-generic.usecase";
import { HttpClient } from "../infraestructure/http/http-client";
import { GetPokemonXNameUseCase } from "../application/use-cases/generic/get-pokemonxname.usecase";
import { PokeApiAdapter } from "../infraestructure/adapters/poke-api.adapter";
import { UsersController } from "../infraestructure/controllers/v1/users.controller";
import { LoginUserUseCase } from "../application/use-cases/users/login-user.usecase";
import { RegisterUserUseCase } from "../application/use-cases/users/register-user.usecase";
import { UserRepository } from "../infraestructure/database/repositories/user.repository";
import { GetMeUseCase } from "../application/use-cases/users/get-me-user.usecase";
import { GetBalanceUseCase } from "../application/use-cases/accounts/get-balance.usecase";
import { AccountsController } from "../infraestructure/controllers/v1/accounts.controller";
import { AccountRepository } from "../infraestructure/database/repositories/account.repository";
import { GetTransactionsUseCase } from "../application/use-cases/transactions/get-transactions.usecase";
import { TransactionsController } from "../infraestructure/controllers/v1/transactions.controller";
import { TransactionRepository } from "../infraestructure/database/repositories/transaction.repository";
import { AccumulatePointsUseCase } from "../application/use-cases/transactions/accumulate-points.usecase";
import { RedeemPointsUseCase } from "../application/use-cases/transactions/redeem-points.usecase";

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC
});

container.register({
  // Use cases
  getGenericUseCase: asClass(GetGenericUseCase).scoped(),
  createGenericUseCase: asClass(CreateGenericUseCase).scoped(),
  updateGenericUseCase: asClass(UpdateGenericUseCase).scoped(),
  getXIdGenericUseCase: asClass(GetXIdGenericUseCase).scoped(),
  getPokemonXNameUseCase: asClass(GetPokemonXNameUseCase).scoped(),
  loginUserUseCase: asClass(LoginUserUseCase).scoped(),
  registerUserUseCase: asClass(RegisterUserUseCase).scoped(),
  getMeUseCase: asClass(GetMeUseCase).scoped(),
  getBalanceUseCase: asClass(GetBalanceUseCase).scoped(),
  getTransactionsUseCase: asClass(GetTransactionsUseCase).scoped(),
  accumulatePointsUseCase: asClass(AccumulatePointsUseCase).scoped(),
  redeemPointsUseCase: asClass(RedeemPointsUseCase).scoped(),

  // Services
  healthService: asClass(HealthService).singleton(),
  authService: asClass(JwtAuthService).singleton(),

  // Adapter
  pokeApiAdapter: asClass(PokeApiAdapter).singleton(),

  // Controllers
  healthController: asClass(HealthController).scoped(),
  genericController: asClass(GenericController).scoped(),
  usersController: asClass(UsersController).scoped(),
  accountsController: asClass(AccountsController).scoped(),
  transactionsController: asClass(TransactionsController).scoped(),

  httpClient: asClass(HttpClient).singleton()
});

container.register({
  logger: asClass(WinstonLogger).singleton()
});

container.register({
  genericRepository: asClass(GenericRepository).scoped(),
  userRepository: asClass(UserRepository).scoped(),
  accountRepository: asClass(AccountRepository).scoped(),
  transactionRepository: asClass(TransactionRepository).scoped(),
});