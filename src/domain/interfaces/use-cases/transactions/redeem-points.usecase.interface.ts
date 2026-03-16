import {
  RedeemPointsRequestDTO,
  RedeemPointsResponseDTO
} from "../../../../application/dto/redeem-points.dto";

export interface IRedeemPointsUseCase {
  execute(request: RedeemPointsRequestDTO): Promise<RedeemPointsResponseDTO>
}