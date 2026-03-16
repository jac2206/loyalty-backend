import bcrypt from "bcrypt";
import {
  LoginUserRequestDTO,
  LoginUserResponseDTO
} from "../../dto/login-user.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import { ILoginUserUseCase } from "../../../domain/interfaces/use-cases/users/login-user.usecase.interface";
import { IAuthService } from "../../../domain/interfaces/services/auth.service.interface";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";

export class LoginUserUseCase implements ILoginUserUseCase {

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService
  ) {}

  async execute(data: LoginUserRequestDTO): Promise<LoginUserResponseDTO> {

    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      const error = DomainErrors.USER_INVALID_CREDENTIALS;
      throw new DomainException(error.code, error.message, error.statusCode);
    };

    const validPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!validPassword) {
      const error = DomainErrors.USER_INVALID_CREDENTIALS;
      throw new DomainException(error.code, error.message, error.statusCode);
    };

    const token = this.authService.generateToken({
      sub: user.documentNumber,
      email: user.email,
      type: "access",
      scopes: ["user"]
    });

    const response: LoginUserResponseDTO = {
      token
    };

    return response;
  };

}