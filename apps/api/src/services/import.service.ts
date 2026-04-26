import { v4 as uuidv4 } from 'uuid';
import { cacheService } from './cache.service';
import { importRepository } from '../repositories/import.repository';
import { parseAlumniExcel } from '../utils/excel-parser';
import { AppError } from '../utils/app-error';
import { ImportDraft } from '../types';
import { logger } from '../utils/logger';

/**
 * Import service - Excel upload, preview, and confirm workflow.
 */
export const importService = {
  /**
   * Step 1: Upload and preview Excel file.
   * Parses the file, creates a draft in cache, returns preview data.
   */
  async uploadAndPreview(fileBuffer: Buffer) {
    const parsed = parseAlumniExcel(fileBuffer);

    if (parsed.valid_rows.length === 0 && parsed.invalid_rows.length === 0) {
      throw AppError.badRequest('File Excel kosong atau tidak memiliki data yang dapat diproses');
    }

    const importId = uuidv4();

    const draft: ImportDraft = {
      import_id: importId,
      valid_rows: parsed.valid_rows,
      invalid_rows: parsed.invalid_rows,
      total_valid: parsed.total_valid,
      total_invalid: parsed.total_invalid,
      created_at: Date.now(),
    };

    cacheService.set<ImportDraft>(importId, draft);

    const totalRows = draft.total_valid + draft.total_invalid;
    logger.info(`[Import Excel] Total rows processed: ${totalRows}`);
    logger.info(`[Import Excel] Valid rows: ${draft.total_valid}, Invalid rows: ${draft.total_invalid}`);

    if (draft.invalid_rows.length > 0) {
      const MAX_LOG = 20;
      logger.warn(`[Import Excel] Invalid rows details (${draft.invalid_rows.length} total):`);
      draft.invalid_rows.slice(0, MAX_LOG).forEach((row) => {
        logger.warn(` - Baris ${row.row_number}: ${row.errors.join(', ')}`);
      });
      if (draft.invalid_rows.length > MAX_LOG) {
        logger.warn(`   ...and ${draft.invalid_rows.length - MAX_LOG} more invalid rows`);
      }
    }

    return {
      import_id: importId,
      total_valid: draft.total_valid,
      total_invalid: draft.total_invalid,
      invalid_rows: draft.invalid_rows,
    };
  },

  /**
   * Step 2: Confirm and batch insert the draft.
   * Retrieves draft from cache, inserts valid rows, cleans up.
   */
  async confirm(importId: string) {
    const draft = cacheService.get<ImportDraft>(importId);

    if (!draft) {
      throw AppError.notFound('Import draft tidak ditemukan atau sudah kedaluwarsa. Silakan upload ulang.');
    }

    if (draft.valid_rows.length === 0) {
      cacheService.delete(importId);
      throw AppError.badRequest('Tidak ada data valid untuk diimport');
    }

    let result;
    try {
      result = await importRepository.batchInsertAlumni(draft.valid_rows);
    } catch (err: any) {
      if (err.code === '23502') {
        throw AppError.badRequest('Data tidak valid: field wajib terpantau kosong oleh Database');
      } else if (err.code === '23505') {
        throw AppError.badRequest('Data duplikat: terdapat kunci unik yang bertabrakan di Database');
      } else if (err.code === '40P01') {
        throw AppError.internal('Sistem sedang sibuk memproses transaksi lain (Deadlock). Silakan coba lagi.');
      }
      throw err;
    }

    // Clean up cache
    cacheService.delete(importId);

    const totalFailedRows = result.failed_details.reduce((acc, detail) => acc + detail.rows.length, 0);

    logger.info(`Import confirmed: ${importId} (${result.inserted} inserted, ${result.updated} updated, ${totalFailedRows} failed rows)`);

    return {
      import_id: importId,
      total_processed: draft.valid_rows.length - totalFailedRows,
      inserted: result.inserted,
      updated: result.updated,
      failed_details: result.failed_details,
    };
  },
};
