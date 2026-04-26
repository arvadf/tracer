import { PoolClient } from 'pg';
import { withTransaction } from '../db/transaction';

/**
 * Import repository - batch insert alumni from validated Excel rows.
 */
export const importRepository = {
  async batchInsertAlumni(
    rows: Array<{ nama_lengkap: string; nim: string; tahun_lulus: number | null; tanggal_lahir: string | null }>
  ): Promise<{ 
    inserted: number; 
    updated: number; 
    failed_details: Array<{ chunk: number; reason: string; rows: string[] }> 
  }> {
    // 🛡️ Defensive barrier: never trust the upstream parser blindly
    const currentYear = new Date().getFullYear();
    for (const row of rows) {
      if (row.tahun_lulus !== null) {
        if (!Number.isInteger(row.tahun_lulus)) {
          throw new Error(`Invariant violation: tahun_lulus bukan integer for nim ${row.nim}`);
        }
        if (row.tahun_lulus < 1900 || row.tahun_lulus > currentYear + 1) {
          throw new Error(`Invariant violation: tahun_lulus out of range for nim ${row.nim}`);
        }
      }
    }

    let insertedCount = 0;
    let updatedCount = 0;
    const failedDetails: Array<{ chunk: number; reason: string; rows: string[] }> = [];
    const CHUNK_SIZE = 500;

    const sortedRows = [...rows].sort((a, b) => a.nim.localeCompare(b.nim));

    for (let i = 0; i < sortedRows.length; i += CHUNK_SIZE) {
      const chunk = sortedRows.slice(i, i + CHUNK_SIZE);
      const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
      try {
        await withTransaction(async (client: PoolClient) => {
          const valuePlaheholders: string[] = [];
          const queryParams: unknown[] = [];
          let paramIdx = 1;

          for (const row of chunk) {
            valuePlaheholders.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
            queryParams.push(row.nama_lengkap, row.nim, row.tahun_lulus, row.tanggal_lahir);
          }

          const result = await client.query<{ is_insert: boolean }>(
            `INSERT INTO alumni (nama_lengkap, nim, tahun_lulus, tanggal_lahir)
             VALUES ${valuePlaheholders.join(', ')}
             ON CONFLICT (nim) DO UPDATE 
             SET 
               nama_lengkap = CASE 
                 WHEN EXCLUDED.nama_lengkap IS NOT NULL AND BTRIM(EXCLUDED.nama_lengkap) <> '' 
                 THEN EXCLUDED.nama_lengkap 
                 ELSE alumni.nama_lengkap 
               END,
               tahun_lulus = COALESCE(EXCLUDED.tahun_lulus, alumni.tahun_lulus),
               tanggal_lahir = COALESCE(EXCLUDED.tanggal_lahir, alumni.tanggal_lahir)
             RETURNING (xmax = 0) AS is_insert`,
            queryParams
          );
          
          for (const row of result.rows) {
            if (row.is_insert) {
              insertedCount++;
            } else {
              updatedCount++;
            }
          }
        });
      } catch (err: any) {
        console.error(`[Import Error] Chunk ${chunkIndex} failed to insert. Reason:`, err.message);
        failedDetails.push({
          chunk: chunkIndex,
          reason: err.message || 'Unknown database error',
          rows: chunk.map(r => r.nim)
        });
      }
    }

    return { inserted: insertedCount, updated: updatedCount, failed_details: failedDetails };
  },
};
