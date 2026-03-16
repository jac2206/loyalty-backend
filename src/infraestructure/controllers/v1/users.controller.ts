import { Request, Response } from "express";
import {
  LoginUserRequestDTO,
  LoginUserResponseDTO
} from "../../../application/dto/login-user.dto";
import { RegisterUserRequestDTO, RegisterUserResponseDTO } from "../../../application/dto/register-user.dto";
import { GetMeResponseDTO } from "../../../application/dto/me-user.dto";
import { IRegisterUserUseCase } from "../../../domain/interfaces/use-cases/users/register-user.usecase.interface";
import { ILoginUserUseCase } from "../../../domain/interfaces/use-cases/users/login-user.usecase.interface";
import { IGetMeUseCase } from "../../../domain/interfaces/use-cases/users/get-me.usecase.interface";

export class UsersController {

  constructor(
    private readonly registerUserUseCase: IRegisterUserUseCase ,
    private readonly loginUserUseCase: ILoginUserUseCase,
    private readonly getMeUseCase: IGetMeUseCase
  ) {}

  register = async (
    req: Request,
    res: Response<RegisterUserResponseDTO>
  ): Promise<void> => {
    const result = await this.registerUserUseCase.execute(req.body);
    res.status(201).json(result);
  };

  login = async (
    req: Request,
    res: Response<LoginUserResponseDTO>
  ): Promise<void> => {
    const result = await this.loginUserUseCase.execute(req.body);
    res.status(200).json(result);
  };

  getMe = async (
    req: Request, 
    res: Response<GetMeResponseDTO>
  ): Promise<void> => {
    const userId = (req as any).user.sub;
    const result = await this.getMeUseCase.execute(userId);
    res.status(200).json(result);
  };
}