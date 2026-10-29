export interface UpdateUserRequestDTO {
  email: string;
  fullName: string;
}

export interface UpdateUserResponseDTO {
  documentNumber: string;
  documentType: string;
  fullName: string;
  email: string;
  phone: string | null;
}
