import { Request, Response } from "express";
import { IGetBalanceUseCase } from "../../../domain/interfaces/use-cases/accounts/get-balance.usecase.interface";
import { GetBalanceResponseDTO } from "../../../application/dto/get-balance.dto";

export class AccountsController {

  constructor(
    private readonly getBalanceUseCase: IGetBalanceUseCase
  ) {}

  getBalance = async (
    req: Request,
    res: Response<GetBalanceResponseDTO>
  ): Promise<void> => {
    const { documentType, documentNumber } = req.params as {
      documentType: string;
      documentNumber: string;
    };
    const result = await this.getBalanceUseCase.execute(
      documentType,
      documentNumber
    );
    res.status(200).json(result);
  };

}