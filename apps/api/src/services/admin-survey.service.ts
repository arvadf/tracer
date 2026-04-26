import { surveyRepository } from '../repositories/survey.repository';
import { AppError } from '../utils/app-error';
import { buildPaginationMeta } from '../utils/pagination';
import { PaginationMeta } from '../types';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { cacheService } from './cache.service';
import { parseSurveyExcel, ParsedSurveyExcelResult } from '../utils/excel-parser';
import { alumniRepository } from '../repositories/alumni.repository';
import { logger } from '../utils/logger';

interface SurveyImportDraft extends ParsedSurveyExcelResult {
  import_id: string;
  created_at: number;
}

/**
 * Admin survey management service.
 */
export const adminSurveyService = {
  /**
   * List surveys with pagination and filters.
   */
  async list(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
    search?: string;
    tahunLulus?: number;
    statusPekerjaan?: string;
    lanjutPpg?: boolean;
    statusPengisian?: string;
  }): Promise<{ items: unknown[]; meta: PaginationMeta }> {
    const { items, total } = await surveyRepository.findWithFilters({
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      search: params.search,
      tahunLulus: params.tahunLulus,
      statusPekerjaan: params.statusPekerjaan,
      lanjutPpg: params.lanjutPpg,
      statusPengisian: params.statusPengisian,
    });

    const meta = buildPaginationMeta(total, {
      page: params.page,
      limit: params.limit,
    });

    return { items, meta };
  },

  /**
   * Get a single survey by ID with alumni info.
   */
  async getById(id: number) {
    return surveyRepository.findById(id);
  },

  /**
   * Update a survey by ID.
   */
  async update(id: number, data: any) {
    const existing = await surveyRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Survey tidak ditemukan');
    }

    // Sinkronisasi tahun lulus konfirmasi ke data alumni
    if (data.tahun_lulus_konfirmasi && data.tahun_lulus_konfirmasi !== existing.tahun_lulus) {
      await alumniRepository.update(existing.alumni_id, { tahun_lulus: data.tahun_lulus_konfirmasi });
    }

    return surveyRepository.updateById(id, data);
  },

  /**
   * Delete a survey by its ID.
   */
  async delete(id: number) {
    const deleted = await surveyRepository.deleteById(id);
    if (!deleted) {
      throw AppError.notFound('Survey tidak ditemukan');
    }
  },

  /**
   * Export surveys as Excel buffer.
   */
  async exportExcel(filters: {
    tahunLulus?: number;
    statusPekerjaan?: string;
    lanjutPpg?: boolean;
  }): Promise<Buffer> {
    const rows = await surveyRepository.listAll(filters);

    const data = rows.map((row) => ({
      'Nama Lengkap': row.nama_lengkap,
      'NIM': row.nim,
      'Tahun Lulus Konfirmasi': row.tahun_lulus_konfirmasi,
      'Status Pekerjaan': row.status_pekerjaan,
      'Nama Instansi': row.nama_instansi,
      'Nomor HP': row.nomor_hp,
      'Lanjut S2/S3': row.lanjut_s2s3 ? 'Ya' : 'Tidak',
      'Jurusan S2/S3': row.jurusan_s2s3 || '-',
      'Universitas S2/S3': row.universitas_s2s3 || '-',
      'Lanjut PPG': row.lanjut_ppg ? 'Ya' : 'Tidak',
      'Tahun PPG': row.tahun_ppg || '-',
      'Universitas PPG': row.universitas_ppg || '-',
      'Pesan & Saran': row.pesan_saran || '-',
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Surveys');

    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  },

  /**
   * Import Survey: Step 1 - Upload and Preview
   */
  async uploadAndPreview(fileBuffer: Buffer) {
    const parsed = parseSurveyExcel(fileBuffer);

    if (parsed.valid_rows.length === 0 && parsed.invalid_rows.length === 0) {
      throw AppError.badRequest('File Excel kosong atau tidak memiliki data yang dapat diproses');
    }

    const importId = uuidv4();

    const draft: SurveyImportDraft = {
      import_id: importId,
      valid_rows: parsed.valid_rows,
      invalid_rows: parsed.invalid_rows,
      total_valid: parsed.total_valid,
      total_invalid: parsed.total_invalid,
      created_at: Date.now(),
    };

    cacheService.set<SurveyImportDraft>(`survey_${importId}`, draft);

    return {
      import_id: importId,
      total_valid: draft.total_valid,
      total_invalid: draft.total_invalid,
      invalid_rows: draft.invalid_rows,
    };
  },

  /**
   * Import Survey: Step 2 - Confirm and Insert
   */
  async confirmImport(importId: string) {
    const draft = cacheService.get<SurveyImportDraft>(`survey_${importId}`);

    if (!draft) {
      throw AppError.notFound('Import draft tidak ditemukan atau expired.');
    }

    if (draft.valid_rows.length === 0) {
      cacheService.delete(`survey_${importId}`);
      throw AppError.badRequest('Tidak ada data valid untuk diimport');
    }

    let inserted = 0;
    let skipped = 0;

    for (const row of draft.valid_rows) {
      // Find alumni by NIM
      const alumni = await alumniRepository.findByNim(row.nim);
      if (!alumni) {
        skipped++;
        continue;
      }

      const existingSurvey = await surveyRepository.findByAlumniId(alumni.id);
      if (existingSurvey) {
        await surveyRepository.updateByAlumniId(alumni.id, row);
      } else {
        await surveyRepository.create(alumni.id, row);
      }

      // Sinkronisasi tahun lulus konfirmasi ke data alumni
      if (row.tahun_lulus_konfirmasi && row.tahun_lulus_konfirmasi !== alumni.tahun_lulus) {
        await alumniRepository.update(alumni.id, { tahun_lulus: row.tahun_lulus_konfirmasi });
      }

      inserted++;
    }

    cacheService.delete(`survey_${importId}`);

    return {
      import_id: importId,
      total_processed: draft.valid_rows.length,
      inserted,
      skipped,
    };
  },
};

