import { pool } from "../../database/postgres";
import { IAccountRepository } from "../../../domain/interfaces/repositories/account.repository.interface";

export class AccountRepository implements IAccountRepository {

  async getBalanceByDocument(
    documentType: string,
    documentNumber: string
  ): Promise<number | null> {

    const result = await pool.query(
      `SELECT a.points_balance
       FROM loyalty.accounts a
       JOIN loyalty.users u ON u.id = a.user_id
       WHERE u.document_type = $1
       AND u.document_number = $2`,
      [documentType, documentNumber]
    );

    if (result.rows.length === 0) return null;

    return result.rows[0].points_balance;
  };

  async getAccountIdByDocument(
    documentType: string,
    documentNumber: string
  ): Promise<string | null> {

    const result = await pool.query(
      `SELECT a.id
       FROM loyalty.accounts a
       JOIN loyalty.users u ON u.id = a.user_id
       WHERE u.document_type = $1
       AND u.document_number = $2`,
      [documentType, documentNumber]
    );

    if (result.rows.length === 0) return null;

    return result.rows[0].id;
  };

  async addPoints(
    accountId: string,
    points: number
  ): Promise<number> {

    const result = await pool.query(
      `UPDATE loyalty.accounts
      SET points_balance = points_balance + $1
      WHERE id = $2
      RETURNING points_balance`,
      [points, accountId]
    );

    return result.rows[0].points_balance;
  };

  async getBalance(accountId: string): Promise<number> {

    const result = await pool.query(
      `SELECT points_balance
      FROM loyalty.accounts
      WHERE id = $1`,
      [accountId]
    );

    return result.rows[0].points_balance;
  };

  async subtractPoints(
    accountId: string,
    points: number
  ): Promise<number> {

    const result = await pool.query(
      `UPDATE loyalty.accounts
      SET points_balance = points_balance - $1
      WHERE id = $2
      RETURNING points_balance`,
      [points, accountId]
    );

    return result.rows[0].points_balance;
  };

}