import { pool } from '../db/pool';
import { Survey, SurveyInput } from '../types';

/**
 * Survey repository - raw SQL queries for surveys table.
 */
export const surveyRepository = {
  /**
   * Find survey by alumni_id.
   */
  async findByAlumniId(alumniId: number): Promise<Survey | null> {
    const result = await pool.query(
      `SELECT * FROM surveys WHERE alumni_id = $1`,
      [alumniId]
    );
    return result.rows[0] || null;
  },

  /**
   * Check if survey exists for alumni_id.
   */
  async existsByAlumniId(alumniId: number): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM surveys WHERE alumni_id = $1 LIMIT 1`,
      [alumniId]
    );
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Create survey for an alumni.
   */
  async create(alumniId: number, data: SurveyInput): Promise<Survey> {
    const result = await pool.query(
      `INSERT INTO surveys (
        alumni_id, tahun_lulus_konfirmasi, status_pekerjaan, nama_instansi, nomor_hp,
        lanjut_s2s3, jurusan_s2s3, universitas_s2s3,
        lanjut_ppg, tahun_ppg, universitas_ppg, pesan_saran
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        alumniId,
        data.tahun_lulus_konfirmasi,
        data.status_pekerjaan,
        data.nama_instansi,
        data.nomor_hp,
        data.lanjut_s2s3,
        data.jurusan_s2s3,
        data.universitas_s2s3,
        data.lanjut_ppg,
        data.tahun_ppg,
        data.universitas_ppg,
        data.pesan_saran,
      ]
    );
    return result.rows[0];
  },

  /**
   * Update survey by alumni_id (full replacement).
   */
  async updateByAlumniId(alumniId: number, data: SurveyInput): Promise<Survey | null> {
    const result = await pool.query(
      `UPDATE surveys SET
        tahun_lulus_konfirmasi = $2,
        status_pekerjaan = $3,
        nama_instansi = $4,
        nomor_hp = $5,
        lanjut_s2s3 = $6,
        jurusan_s2s3 = $7,
        universitas_s2s3 = $8,
        lanjut_ppg = $9,
        tahun_ppg = $10,
        universitas_ppg = $11,
        pesan_saran = $12
      WHERE alumni_id = $1
      RETURNING *`,
      [
        alumniId,
        data.tahun_lulus_konfirmasi,
        data.status_pekerjaan,
        data.nama_instansi,
        data.nomor_hp,
        data.lanjut_s2s3,
        data.jurusan_s2s3,
        data.universitas_s2s3,
        data.lanjut_ppg,
        data.tahun_ppg,
        data.universitas_ppg,
        data.pesan_saran,
      ]
    );
    return result.rows[0] || null;
  },

  /**
   * Update survey by id.
   */
  async updateById(id: number, data: SurveyInput): Promise<Survey | null> {
    const result = await pool.query(
      `UPDATE surveys SET
        tahun_lulus_konfirmasi = $2,
        status_pekerjaan = $3,
        nama_instansi = $4,
        nomor_hp = $5,
        lanjut_s2s3 = $6,
        jurusan_s2s3 = $7,
        universitas_s2s3 = $8,
        lanjut_ppg = $9,
        tahun_ppg = $10,
        universitas_ppg = $11,
        pesan_saran = $12
      WHERE id = $1
      RETURNING *`,
      [
        id,
        data.tahun_lulus_konfirmasi,
        data.status_pekerjaan,
        data.nama_instansi,
        data.nomor_hp,
        data.lanjut_s2s3,
        data.jurusan_s2s3,
        data.universitas_s2s3,
        data.lanjut_ppg,
        data.tahun_ppg,
        data.universitas_ppg,
        data.pesan_saran,
      ]
    );
    return result.rows[0] || null;
  },

  /**
   * List surveys with pagination, sorting, and filters (joined with alumni).
   */
  async findWithFilters(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
    search?: string;
    tahunLulus?: number;
    statusPekerjaan?: string;
    lanjutPpg?: boolean;
    statusPengisian?: string; // 'semua', 'sudah', 'belum'
  }): Promise<{ items: Array<Survey & { nama_lengkap: string; nim: string; tahun_lulus: number }>; total: number }> {
    const allowedSorts: Record<string, string> = {
      nama_lengkap: 'a.nama_lengkap',
      tahun_lulus_konfirmasi: 's.tahun_lulus_konfirmasi',
      status_pekerjaan: 's.status_pekerjaan',
      created_at: 'COALESCE(s.created_at, a.created_at)', // Handle nulls for "belum isi"
    };
    const orderCol = allowedSorts[params.sortBy] || 'COALESCE(s.created_at, a.created_at)';
    const order = params.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (params.page - 1) * params.limit;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (params.search) {
      conditions.push(`a.nama_lengkap ILIKE $${paramIdx}`);
      values.push(`%${params.search}%`);
      paramIdx++;
    }
    if (params.tahunLulus) {
      // Filter by alumni's official grad year when checking "semua" or "belum"
      conditions.push(`a.tahun_lulus = $${paramIdx}`);
      values.push(params.tahunLulus);
      paramIdx++;
    }
    if (params.statusPekerjaan) {
      conditions.push(`s.status_pekerjaan = $${paramIdx}`);
      values.push(params.statusPekerjaan);
      paramIdx++;
    }
    if (params.lanjutPpg !== undefined) {
      conditions.push(`s.lanjut_ppg = $${paramIdx}`);
      values.push(params.lanjutPpg);
      paramIdx++;
    }
    
    // Status pengisian survey
    if (params.statusPengisian === 'sudah') {
      conditions.push(`s.id IS NOT NULL`);
    } else if (params.statusPengisian === 'belum') {
      conditions.push(`s.id IS NULL`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total 
       FROM alumni a 
       LEFT JOIN surveys s ON s.alumni_id = a.id 
       ${whereClause}`,
      values
    );
    const total = countResult.rows[0].total;

    const dataResult = await pool.query(
      `SELECT s.*, a.nama_lengkap, a.nim, a.tahun_lulus
       FROM alumni a
       LEFT JOIN surveys s ON s.alumni_id = a.id
       ${whereClause}
       ORDER BY ${orderCol} ${order}
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...values, params.limit, offset]
    );

    return { items: dataResult.rows, total };
  },

  /**
   * Get all surveys with filters (for export, no pagination).
   */
  async listAll(filters: {
    tahunLulus?: number;
    statusPekerjaan?: string;
    lanjutPpg?: boolean;
  }): Promise<Array<Survey & { nama_lengkap: string; nim: string }>> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (filters.tahunLulus) {
      conditions.push(`s.tahun_lulus_konfirmasi = $${paramIdx}`);
      values.push(filters.tahunLulus);
      paramIdx++;
    }
    if (filters.statusPekerjaan) {
      conditions.push(`s.status_pekerjaan = $${paramIdx}`);
      values.push(filters.statusPekerjaan);
      paramIdx++;
    }
    if (filters.lanjutPpg !== undefined) {
      conditions.push(`s.lanjut_ppg = $${paramIdx}`);
      values.push(filters.lanjutPpg);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT s.*, a.nama_lengkap, a.nim
       FROM surveys s
       INNER JOIN alumni a ON a.id = s.alumni_id
       ${whereClause}
       ORDER BY a.nama_lengkap ASC`,
      values
    );

    return result.rows;
  },

  /**
   * Delete a survey by ID.
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM surveys WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Get status_pekerjaan distribution counts.
   */
  async countByStatusPekerjaan(): Promise<Array<{ label: string; value: number }>> {
    const result = await pool.query(
      `SELECT status_pekerjaan AS label, COUNT(*)::int AS value FROM surveys GROUP BY status_pekerjaan ORDER BY value DESC`
    );
    return result.rows;
  },

  /**
   * Get universitas_ppg distribution counts (only where lanjut_ppg is true).
   */
  async countByUniversitasPpg(): Promise<Array<{ label: string; value: number }>> {
    const result = await pool.query(
      `SELECT universitas_ppg AS label, COUNT(*)::int AS value FROM surveys WHERE lanjut_ppg = true AND universitas_ppg IS NOT NULL GROUP BY universitas_ppg ORDER BY value DESC`
    );
    return result.rows;
  },

  /**
   * Get universitas_s2s3 distribution counts.
   */
  async countByUniversitasS2s3(): Promise<Array<{ label: string; value: number }>> {
    const result = await pool.query(
      `SELECT universitas_s2s3 AS label, COUNT(*)::int AS value FROM surveys WHERE lanjut_s2s3 = true AND universitas_s2s3 IS NOT NULL GROUP BY universitas_s2s3 ORDER BY value DESC`
    );
    return result.rows;
  },

  /**
   * Get total count of surveys.
   */
  async countTotal(): Promise<number> {
    const result = await pool.query(`SELECT COUNT(*)::int AS total FROM surveys`);
    return result.rows[0].total;
  },

  /**
   * Find a single survey by ID (with alumni join).
   */
  async findById(id: number): Promise<(Survey & { nama_lengkap: string; nim: string; tahun_lulus: number }) | null> {
    const result = await pool.query(
      `SELECT s.*, a.nama_lengkap, a.nim, a.tahun_lulus
       FROM surveys s
       INNER JOIN alumni a ON a.id = s.alumni_id
       WHERE s.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * PPG distribution: Ya vs Tidak counts.
   */
  async countPpgDistribution(): Promise<Array<{ label: string; value: number }>> {
    const result = await pool.query(
      `SELECT
         CASE WHEN lanjut_ppg = true THEN 'Ya' ELSE 'Tidak' END AS label,
         COUNT(*)::int AS value
       FROM surveys
       GROUP BY lanjut_ppg
       ORDER BY label`
    );
    return result.rows;
  },

  /**
   * S2/S3 distribution: Ya vs Tidak counts.
   */
  async countS2s3Distribution(): Promise<Array<{ label: string; value: number }>> {
    const result = await pool.query(
      `SELECT
         CASE WHEN lanjut_s2s3 = true THEN 'Ya' ELSE 'Tidak' END AS label,
         COUNT(*)::int AS value
       FROM surveys
       GROUP BY lanjut_s2s3
       ORDER BY label`
    );
    return result.rows;
  },

  /**
   * Count surveys by graduation year (tahun_lulus_konfirmasi).
   */
  async countByTahunLulus(): Promise<Array<{ label: string; value: number }>> {
    const result = await pool.query(
      `SELECT tahun_lulus_konfirmasi::text AS label, COUNT(*)::int AS value
       FROM surveys
       GROUP BY tahun_lulus_konfirmasi
       ORDER BY tahun_lulus_konfirmasi ASC`
    );
    return result.rows;
  },

  /**
   * Count by jurusan S2/S3 (only lanjut_s2s3 = true).
   */
  async countByJurusanS2s3(): Promise<Array<{ label: string; value: number }>> {
    const result = await pool.query(
      `SELECT jurusan_s2s3 AS label, COUNT(*)::int AS value
       FROM surveys
       WHERE lanjut_s2s3 = true AND jurusan_s2s3 IS NOT NULL
       GROUP BY jurusan_s2s3
       ORDER BY value DESC`
    );
    return result.rows;
  },
};
