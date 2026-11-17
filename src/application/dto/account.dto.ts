export interface AccountResponseDTO {
  id: string;
  userId: string;
  pointsBalance: number;
  status: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UpdateAccountStatusRequestDTO {
  status: boolean;
}
