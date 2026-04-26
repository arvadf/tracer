import { pool } from '../db/pool';
import { Alumni } from '../types';

const ALUMNI_COLUMNS = 'a.id, a.nama_lengkap, a.nim, a.tahun_lulus, a.tanggal_lahir, a.created_at, a.updated_at';

/**
 * Alumni repository - raw SQL queries for alumni table.
 */
export const alumniRepository = {
  /**
   * Case-insensitive search alumni by name or NIM.
   */
  async search(query: string, limit: number, sortBy: string, sortOrder: string): Promise<{ items: (Alumni & { survey_exists: boolean })[]; total: number }> {
    const allowedSorts: Record<string, string> = {
      nama_lengkap: 'a.nama_lengkap',
      tahun_lulus: 'a.tahun_lulus',
    };
    const orderCol = allowedSorts[sortBy] || 'a.nama_lengkap';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const searchCondition = `(a.nama_lengkap ILIKE $1 OR a.nim ILIKE $1)`;

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM alumni a WHERE ${searchCondition}`,
      [`%${query}%`]
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataResult = await pool.query(
      `SELECT ${ALUMNI_COLUMNS}, (s.id IS NOT NULL) AS survey_exists
       FROM alumni a
       LEFT JOIN surveys s ON s.alumni_id = a.id
       WHERE ${searchCondition}
       ORDER BY ${orderCol} ${order}
       LIMIT $2`,
      [`%${query}%`, limit]
    );

    return { items: dataResult.rows, total };
  },

  /**
   * Find alumni by ID.
   */
  async findById(id: number): Promise<Alumni | null> {
    const result = await pool.query(
      `SELECT ${ALUMNI_COLUMNS} FROM alumni a WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find alumni by Email.
   */
  async findByEmail(email: string): Promise<Alumni | null> {
    const result = await pool.query(
      `SELECT ${ALUMNI_COLUMNS}, a.email FROM alumni a WHERE a.email = $1`,
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Find alumni by NIM.
   */
  async findByNim(nim: string): Promise<Alumni | null> {
    const result = await pool.query(
      `SELECT ${ALUMNI_COLUMNS}, a.email FROM alumni a WHERE a.nim = $1`,
      [nim]
    );
    return result.rows[0] || null;
  },

  /**
   * Update alumni email.
   */
  async updateEmail(id: number, email: string): Promise<void> {
    await pool.query('UPDATE alumni SET email = $1 WHERE id = $2', [email, id]);
  },


  /**
   * Verify alumni birth date. Returns true if matches.
   */
  async verifyBirthDate(alumniId: number, tanggalLahir: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM alumni WHERE id = $1 AND tanggal_lahir = $2::date`,
      [alumniId, tanggalLahir]
    );
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * List alumni with pagination, sorting, and optional filters.
   */
  async list(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
    search?: string;
    tahunLulus?: number;
  }): Promise<{ items: Alumni[]; total: number }> {
    const allowedSorts: Record<string, string> = {
      nama_lengkap: 'a.nama_lengkap',
      nim: 'a.nim',
      tahun_lulus: 'a.tahun_lulus',
      created_at: 'a.created_at',
    };
    const orderCol = allowedSorts[params.sortBy] || 'a.created_at';
    const order = params.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (params.page - 1) * params.limit;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (params.search) {
      conditions.push(`(a.nama_lengkap ILIKE $${paramIdx} OR a.nim ILIKE $${paramIdx})`);
      values.push(`%${params.search}%`);
      paramIdx++;
    }

    if (params.tahunLulus) {
      conditions.push(`a.tahun_lulus = $${paramIdx}`);
      values.push(params.tahunLulus);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM alumni a ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataResult = await pool.query(
      `SELECT ${ALUMNI_COLUMNS}
       FROM alumni a
       ${whereClause}
       ORDER BY ${orderCol} ${order}
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...values, params.limit, offset]
    );

    return { items: dataResult.rows, total };
  },

  /**
   * Create a new alumni.
   */
  async create(data: { nama_lengkap: string; nim: string; tahun_lulus?: number | null; tanggal_lahir?: string | null; email?: string }): Promise<Alumni> {
    const result = await pool.query(
      `INSERT INTO alumni (nama_lengkap, nim, tahun_lulus, tanggal_lahir, email) VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.nama_lengkap, data.nim, data.tahun_lulus ?? new Date().getFullYear(), data.tanggal_lahir || null, data.email || null]
    );
    return result.rows[0];
  },

  /**
   * Update an alumni record.
   */
  async update(id: number, data: Partial<{ nama_lengkap: string; nim: string; tahun_lulus: number | null; tanggal_lahir: string | null }>): Promise<Alumni | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (data.nama_lengkap !== undefined) {
      fields.push(`nama_lengkap = $${paramIdx++}`);
      values.push(data.nama_lengkap);
    }
    if (data.nim !== undefined) {
      fields.push(`nim = $${paramIdx++}`);
      values.push(data.nim);
    }
    if (data.tahun_lulus !== undefined) {
      fields.push(`tahun_lulus = $${paramIdx++}`);
      values.push(data.tahun_lulus);
    }
    if (data.tanggal_lahir !== undefined) {
      fields.push(`tanggal_lahir = $${paramIdx++}`);
      values.push(data.tanggal_lahir);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await pool.query(
      `UPDATE alumni SET ${fields.join(', ')} WHERE id = $${paramIdx}
       RETURNING ${ALUMNI_COLUMNS.replace(/a\./g, '')}`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Delete an alumni by ID.
   */
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM alumni WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Get all alumni for export without pagination.
   */
  async listAll(filters?: { tahunLulus?: number }): Promise<Alumni[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (filters?.tahunLulus) {
      conditions.push(`tahun_lulus = $${paramIdx++}`);
      values.push(filters.tahunLulus);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT ${ALUMNI_COLUMNS.replace(/a\./g, '')}
       FROM alumni 
       ${whereClause} 
       ORDER BY tahun_lulus DESC, nama_lengkap ASC`,
      values
    );
    return result.rows;
  },
};
