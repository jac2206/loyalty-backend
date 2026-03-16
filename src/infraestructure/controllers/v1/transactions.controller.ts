import { Request, Response } from "express"
import { IGetTransactionsUseCase } from "../../../domain/interfaces/use-cases/transactions/get-transactions.usecase.interface"
import { GetTransactionsResponseDTO } from "../../../application/dto/get-transactions.dto"
import { IAccumulatePointsUseCase } from "../../../domain/interfaces/use-cases/transactions/accumulate-points.usecase.interface";
import { AccumulatePointsResponseDTO } from "../../../application/dto/accumulate-points.dto";
import { RedeemPointsResponseDTO } from "../../../application/dto/redeem-points.dto";
import { IRedeemPointsUseCase } from "../../../domain/interfaces/use-cases/transactions/redeem-points.usecase.interface";

export class TransactionsController {

  constructor(
    private readonly getTransactionsUseCase: IGetTransactionsUseCase,
    private readonly accumulatePointsUseCase:IAccumulatePointsUseCase,
    private readonly redeemPointsUseCase: IRedeemPointsUseCase,
  ) {}

  getTransactions = async (
    req: Request,
    res: Response<GetTransactionsResponseDTO>
  ): Promise<void> => {
    const { documentType, documentNumber } = req.params as {
      documentType: string
      documentNumber: string
    };
    const { type } = req.query;
    const result =
      await this.getTransactionsUseCase.execute(
        documentType,
        documentNumber,
        type as string
      );
    res.status(200).json(result);
  };
  
  accumulate = async (
    req: Request,
    res: Response<AccumulatePointsResponseDTO>
  ) => {
    const result = await this.accumulatePointsUseCase.execute(req.body);
    res.status(201).json(result);
  };

  redeem = async (
  req: Request,
  res: Response<RedeemPointsResponseDTO>
    ) => {
    const result =await this.redeemPointsUseCase.execute(req.body);
    res.status(201).json(result);
  };

}