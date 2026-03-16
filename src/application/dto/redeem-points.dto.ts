export interface RedeemPointsRequestDTO {
  documentType: string
  documentNumber: string
  partnerCode: string
  locationCode?: string
  points: number
  reference: string
}

export interface RedeemPointsResponseDTO {
  message: string
  pointsRedeemed: number
  balance: number
}