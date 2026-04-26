import { pool } from '../db/pool';
import { Admin } from '../types';

/**
 * Admin repository - raw SQL queries for admins table.
 */
export const adminRepository = {
  /**
   * Find admin by username.
   */
  async findByUsername(username: string): Promise<Admin | null> {
    const result = await pool.query(
      `SELECT id, username, password_hash, nama, created_at FROM admins WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  },

  async findById(id: number): Promise<Admin | null> {
    const result = await pool.query(
      `SELECT id, username, password_hash, nama, created_at FROM admins WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async updateProfile(id: number, nama: string, username: string): Promise<void> {
    await pool.query(
      `UPDATE admins SET nama = $1, username = $2 WHERE id = $3`,
      [nama, username, id]
    );
  },

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await pool.query(
      `UPDATE admins SET password_hash = $1 WHERE id = $2`,
      [passwordHash, id]
    );
  },
};
