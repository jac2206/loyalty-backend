import { pool } from "../../database/postgres";
import { Transaction } from "../../../domain/entities/transaction.entity";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/transaction.repository.interface";

export class TransactionRepository implements ITransactionRepository {
  async applyPoints(
    input: Parameters<ITransactionRepository["applyPoints"]>[0],
  ): ReturnType<ITransactionRepository["applyPoints"]> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const account = await client.query<{
        id: string;
        status: boolean | null;
        points_balance: number;
      }>(
        `SELECT a.id, a.status, a.points_balance
         FROM loyalty.accounts a JOIN loyalty.users u ON u.id = a.user_id
         WHERE u.document_type = $1 AND u.document_number = $2
         FOR UPDATE OF a`,
        [input.documentType, input.documentNumber],
      );
      const row = account.rows[0];
      if (
        !row ||
        row.status !== true ||
        (input.type === "REDEM" && row.points_balance < input.points)
      ) {
        await client.query("ROLLBACK");
        return {
          outcome: !row
            ? "not-found"
            : row.status !== true
              ? "inactive"
              : "insufficient",
        };
      }
      await client.query(
        `INSERT INTO loyalty.transactions
         (account_id, partner_code, location_code, type, points, money_amount, reference)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          row.id,
          input.partnerCode,
          input.locationCode,
          input.type,
          input.points,
          input.amount,
          input.reference,
        ],
      );
      const result = await client.query<{ points_balance: number }>(
        `UPDATE loyalty.accounts SET points_balance = points_balance + $1
         WHERE id = $2 RETURNING points_balance`,
        [input.type === "ACUM" ? input.points : -input.points, row.id],
      );
      await client.query("COMMIT");
      return { outcome: "success", balance: result.rows[0].points_balance };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findByUser(
    documentType: string,
    documentNumber: string,
    type?: string,
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

    const params: any[] = [documentType, documentNumber];

    if (type) {
      query += " AND t.type = $3";
      params.push(type);
    }

    const result = await pool.query(query, params);

    return result.rows.map(
      (row) =>
        new Transaction(
          row.id,
          row.account_id,
          row.partner_code,
          row.location_code,
          row.type,
          row.points,
          row.money_amount,
          row.reference,
          row.created_at,
        ),
    );
  }

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
        data.reference,
      ],
    );
  }
}
