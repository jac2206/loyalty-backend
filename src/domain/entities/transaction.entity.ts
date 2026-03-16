export class Transaction {

  constructor(
    public readonly id: string | null,
    public readonly accountId: string,
    public readonly partnerCode: string,
    public readonly locationCode: string | null,
    public readonly type: "ACUM" | "REDEM",
    public readonly points: number,
    public readonly amount: number,
    public readonly reference: string,
    public readonly createdAt?: Date
  ) {}

  toPersistence() {
    return {
      id: this.id,
      account_id: this.accountId,
      partner_code: this.partnerCode,
      location_code: this.locationCode,
      type: this.type,
      points: this.points,
      amount: this.amount,
      reference: this.reference,
      created_at: this.createdAt
    };
  }

}