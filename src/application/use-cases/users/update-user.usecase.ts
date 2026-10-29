import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import { IUpdateUserUseCase } from "../../../domain/interfaces/use-cases/users/update-user.usecase.interface";
import { UpdateUserRequestDTO, UpdateUserResponseDTO } from "../../dto/update-user.dto";

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    documentNumber: string,
    authenticatedDocumentNumber: string,
    data: UpdateUserRequestDTO,
  ): Promise<UpdateUserResponseDTO> {
    if (documentNumber !== authenticatedDocumentNumber) {
      const error = DomainErrors.USER_DOCUMENT_MISMATCH;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const user = await this.userRepository.findByDocument(documentNumber);
    if (!user) {
      const error = DomainErrors.USER_NOT_FOUND;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail && existingEmail.documentNumber !== documentNumber) {
      const error = DomainErrors.USER_EMAIL_ALREADY_EXISTS;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const updatedUser = await this.userRepository.updateProfile(
      documentNumber,
      data.email,
      data.fullName,
    );
    if (!updatedUser) {
      const error = DomainErrors.USER_NOT_FOUND;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    return {
      documentNumber: updatedUser.documentNumber,
      documentType: updatedUser.documentType,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
    };
  }
}
