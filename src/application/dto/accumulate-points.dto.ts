export interface AccumulatePointsRequestDTO {
  documentType: string
  documentNumber: string
  partnerCode: string
  locationCode?: string
  amount: number
  reference: string
}

export interface AccumulatePointsResponseDTO {
  message: string
  pointsEarned: number
  balance: number
}