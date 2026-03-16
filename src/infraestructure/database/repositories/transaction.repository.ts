import { pool } from "../../database/postgres"
import { Transaction } from "../../../domain/entities/transaction.entity"
import { ITransactionRepository } from "../../../domain/interfaces/repositories/transaction.repository.interface"

export class TransactionRepository implements ITransactionRepository {

  async findByUser(
    documentType: string,
    documentNumber: string,
    type?: string
  ): Promise<Transaction[]> {

    let query = `
    SELECT
      t.id,
      t.account_id,
      t.partner_code,
      t.location_code,
      t.type,
      t.points,
      t.money_amount,
      t.reference,
      t.created_at
      FROM loyalty.transactions t
      JOIN loyalty.accounts a ON a.id = t.account_id
      JOIN loyalty.users u ON u.id = a.user_id
      WHERE u.document_type = $1
      AND u.document_number = $2
    `;

    const params: any[] = [documentType, documentNumber]

    if (type) {
      query += " AND t.type = $3"
      params.push(type)
    };

    const result = await pool.query(query, params);
    
    return result.rows.map(row =>
      new Transaction(
        row.id,
        row.account_id,
        row.partner_code,
        row.location_code,
        row.type,
        row.points,
        row.money_amount,
        row.reference,
        row.created_at
      )
    )
  };

  async save(transaction: Transaction): Promise<void> {

    const data = transaction.toPersistence();

    await pool.query(
      `INSERT INTO loyalty.transactions
      (account_id, partner_code, location_code, type, points, money_amount, reference)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        data.account_id,
        data.partner_code,
        data.location_code,
        data.type,
        data.points,
        data.amount,
        data.reference
      ]
    );

  };


}