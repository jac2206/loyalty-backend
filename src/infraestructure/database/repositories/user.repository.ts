import { pool } from "../../database/postgres";
import { User } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import { randomUUID } from "node:crypto";

export class UserRepository implements IUserRepository {
  async save(entity: User): Promise<User> {
    const data = entity.toPersistence();

    const result = await pool.query(
      `WITH created_user AS (INSERT INTO loyalty.users
      (document_type, document_number, full_name, email, phone, password_hash, has_pin, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *),
      created_account AS (
        INSERT INTO loyalty.accounts (id, user_id, points_balance, status)
        SELECT $9, id, 0, true FROM created_user RETURNING user_id
      )
      SELECT created_user.* FROM created_user
      JOIN created_account ON created_account.user_id = created_user.id`,
      [
        data.documentType,
        data.documentNumber,
        data.fullName,
        data.email,
        data.phone,
        data.password_hash,
        data.has_pin,
        data.status,
        randomUUID(),
      ],
    );

    const row = result.rows[0];

    return new User(
      row.document_type,
      row.document_number,
      row.full_name,
      row.email,
      row.phone,
      row.password_hash,
      row.has_pin,
      row.status,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(`SELECT * FROM loyalty.users WHERE email = $1`, [
      email,
    ]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    return new User(
      row.document_type,
      row.document_number,
      row.full_name,
      row.email,
      row.phone,
      row.password_hash,
      row.has_pin,
      row.status,
    );
  }

  async findByDocument(documentNumber: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT * FROM loyalty.users WHERE document_number = $1`,
      [documentNumber],
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    return new User(
      row.document_type,
      row.document_number,
      row.full_name,
      row.email,
      row.phone,
      row.password_hash,
      row.has_pin,
      row.status,
    );
  }

  async updateProfile(
    documentNumber: string,
    email: string,
    fullName: string,
  ): Promise<User | null> {
    const result = await pool.query(
      `UPDATE loyalty.users
       SET email = $2, full_name = $3
       WHERE document_number = $1
       RETURNING *`,
      [documentNumber, email, fullName],
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return new User(
      row.document_type,
      row.document_number,
      row.full_name,
      row.email,
      row.phone,
      row.password_hash,
      row.has_pin,
      row.status,
    );
  }

  async findAll(): Promise<User[]> {
    const result = await pool.query(`
      SELECT 
        document_type,
        document_number,
        full_name,
        email,
        phone,
        password_hash,
        has_pin,
        status
      FROM loyalty.users
    `);

    return result.rows.map(
      (row) =>
        new User(
          row.document_type,
          row.document_number,
          row.full_name,
          row.email,
          row.phone,
          row.password_hash,
          row.has_pin,
          row.status,
        ),
    );
  }
}
