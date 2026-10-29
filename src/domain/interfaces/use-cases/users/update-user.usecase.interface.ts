import {
  UpdateUserRequestDTO,
  UpdateUserResponseDTO,
} from "../../../../application/dto/update-user.dto";

export interface IUpdateUserUseCase {
  execute(
    documentNumber: string,
    authenticatedDocumentNumber: string,
    data: UpdateUserRequestDTO,
  ): Promise<UpdateUserResponseDTO>;
}
