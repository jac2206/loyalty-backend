import { Request, Response } from "express";
import { IGetBalanceUseCase } from "../../../domain/interfaces/use-cases/accounts/get-balance.usecase.interface";
import { GetBalanceResponseDTO } from "../../../application/dto/get-balance.dto";
import { IGetAccountUseCase } from "../../../domain/interfaces/use-cases/accounts/get-account.usecase.interface";
import { IUpdateAccountStatusUseCase } from "../../../domain/interfaces/use-cases/accounts/update-account-status.usecase.interface";
import {
  AccountResponseDTO,
  UpdateAccountStatusRequestDTO,
} from "../../../application/dto/account.dto";

export class AccountsController {
  constructor(
    private readonly getBalanceUseCase: IGetBalanceUseCase,
    private readonly getAccountUseCase: IGetAccountUseCase,
    private readonly updateAccountStatusUseCase: IUpdateAccountStatusUseCase,
  ) {}

  getMe = async (req: Request, res: Response<AccountResponseDTO>): Promise<void> => {
    res.status(200).json(await this.getAccountUseCase.execute(req.user!.sub));
  };

  updateStatus = async (
    req: Request,
    res: Response<AccountResponseDTO>,
  ): Promise<void> => {
    const { status } = req.body as UpdateAccountStatusRequestDTO;
    res
      .status(200)
      .json(await this.updateAccountStatusUseCase.execute(req.user!.sub, status));
  };

  getBalance = async (
    req: Request,
    res: Response<GetBalanceResponseDTO>,
  ): Promise<void> => {
    const { documentType, documentNumber } = req.params as {
      documentType: string;
      documentNumber: string;
    };
    const result = await this.getBalanceUseCase.execute(
      documentType,
      documentNumber,
      req.user?.sub ?? "",
    );
    res.status(200).json(result);
  };
}
