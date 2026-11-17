import { pool } from "../../database/postgres";
import {
  AccountRecord,
  IAccountRepository,
} from "../../../domain/interfaces/repositories/account.repository.interface";

type AccountRow = {
  id: string;
  user_id: string;
  points_balance: number;
  status: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
};

const mapAccount = (row: AccountRow): AccountRecord => ({
  id: row.id,
  userId: row.user_id,
  pointsBalance: row.points_balance,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class AccountRepository implements IAccountRepository {
  async findByDocumentNumber(documentNumber: string): Promise<AccountRecord | null> {
    const result = await pool.query<AccountRow>(
      `SELECT a.id, a.user_id, a.points_balance, a.status, a.created_at, a.updated_at
       FROM loyalty.accounts a JOIN loyalty.users u ON u.id = a.user_id
       WHERE u.document_number = $1`,
      [documentNumber],
    );
    return result.rows[0] ? mapAccount(result.rows[0]) : null;
  }

  async updateStatusByDocumentNumber(
    documentNumber: string,
    status: boolean,
  ): Promise<AccountRecord | null> {
    const result = await pool.query<AccountRow>(
      `UPDATE loyalty.accounts a SET status = $2, updated_at = CURRENT_TIMESTAMP
       FROM loyalty.users u WHERE u.id = a.user_id AND u.document_number = $1
       RETURNING a.id, a.user_id, a.points_balance, a.status, a.created_at, a.updated_at`,
      [documentNumber, status],
    );
    return result.rows[0] ? mapAccount(result.rows[0]) : null;
  }
  async getBalanceByDocument(
    documentType: string,
    documentNumber: string,
  ): Promise<number | null> {
    const result = await pool.query(
      `SELECT a.points_balance
       FROM loyalty.accounts a
       JOIN loyalty.users u ON u.id = a.user_id
       WHERE u.document_type = $1
       AND u.document_number = $2`,
      [documentType, documentNumber],
    );

    if (result.rows.length === 0) return null;

    return result.rows[0].points_balance;
  }

  async getAccountIdByDocument(
    documentType: string,
    documentNumber: string,
  ): Promise<string | null> {
    const result = await pool.query(
      `SELECT a.id
       FROM loyalty.accounts a
       JOIN loyalty.users u ON u.id = a.user_id
       WHERE u.document_type = $1
       AND u.document_number = $2`,
      [documentType, documentNumber],
    );

    if (result.rows.length === 0) return null;

    return result.rows[0].id;
  }

  async addPoints(accountId: string, points: number): Promise<number> {
    const result = await pool.query(
      `UPDATE loyalty.accounts
      SET points_balance = points_balance + $1
      WHERE id = $2
      RETURNING points_balance`,
      [points, accountId],
    );

    return result.rows[0].points_balance;
  }

  async getBalance(accountId: string): Promise<number> {
    const result = await pool.query(
      `SELECT points_balance
      FROM loyalty.accounts
      WHERE id = $1`,
      [accountId],
    );

    return result.rows[0].points_balance;
  }

  async subtractPoints(accountId: string, points: number): Promise<number> {
    const result = await pool.query(
      `UPDATE loyalty.accounts
      SET points_balance = points_balance - $1
      WHERE id = $2
      RETURNING points_balance`,
      [points, accountId],
    );

    return result.rows[0].points_balance;
  }
}
