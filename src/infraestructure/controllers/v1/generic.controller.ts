import { Request, Response } from "express";
import { GenericResponseDto, GenericRequestDto } from "../../../application/dto/get-generic.dto";
import { IGetGenericUseCase } from "../../../domain/interfaces/use-cases/get-generic.usecase.interfaces";
import { ICreateGenericUseCase } from "../../../domain/interfaces/use-cases/create-generic.usecase.interface";
import { IUpdateGenericUseCase } from "../../../domain/interfaces/use-cases/update-generic.usecase.interface";
import { IGetXIdGenericUseCase } from "../../../domain/interfaces/use-cases/getxid-generic.usecase.interface";
import { UpdateGenericResponseUseCaseDto } from "../../../application/dto/update-generic.dto";

export class GenericController {
  constructor(
    private readonly getGenericUseCase: IGetGenericUseCase,
    private readonly createGenericUseCase: ICreateGenericUseCase,
    private readonly updateGenericUseCase: IUpdateGenericUseCase,
    private readonly getXIdGenericUseCase: IGetXIdGenericUseCase
  ) {}

  // Request<Params, ResBody, ReqBody, Query>
  getGeneric = async (
    _req: Request, 
    res: Response<GenericResponseDto>
  ):Promise<void> => {
    const result = await this.getGenericUseCase.execute();
    const response: GenericResponseDto = {
      ...result
    };
    res.status(200).json(response);
  }

  postGeneric = async (
    _req: Request<{}, GenericResponseDto, GenericRequestDto>, 
    res: Response<GenericResponseDto>):Promise<void> => {
    const request = _req.body;
    const result = await this.createGenericUseCase.execute(request);
    const response: GenericResponseDto = {
      name: result.name as string,
      lastName: result.lastName,
      age: result.age
    };
    res.status(200).json(response);
  }

  getXIdGeneric = async (
    _req: Request<{id:string}, GenericResponseDto>, 
    res: Response<GenericResponseDto>):Promise<void> => {
    const id = _req.params.id;
    const result = await this.getXIdGenericUseCase.execute(id);
    const response = {
      name: result?.name as string,
      lastName: result?.lastName,
      age: result?.age
    } as GenericRequestDto;
    res.status(200).json(response);
  }

  patchGeneric = async (
    _req: Request<{id:string}, UpdateGenericResponseUseCaseDto, GenericRequestDto>, 
    res: Response<UpdateGenericResponseUseCaseDto>):Promise<void> => {
    const request = _req.body as GenericRequestDto;
    const id = _req.params.id;
    const result = await this.updateGenericUseCase.execute(request, id)
    const response: UpdateGenericResponseUseCaseDto = {
      message: "PATCH request received",
      result: {
        ...result
      }
    };
    res.status(200).json(response);
  }
}