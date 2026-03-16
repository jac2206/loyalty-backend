import {
  AccumulatePointsRequestDTO,
  AccumulatePointsResponseDTO
} from "../../../../application/dto/accumulate-points.dto"

export interface IAccumulatePointsUseCase {

  execute(
    request: AccumulatePointsRequestDTO
  ): Promise<AccumulatePointsResponseDTO>

}