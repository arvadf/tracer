import { alumniRepository } from '../repositories/alumni.repository';
import { surveyRepository } from '../repositories/survey.repository';
import { AppError } from '../utils/app-error';
import { buildPaginationMeta } from '../utils/pagination';
import { PaginationMeta } from '../types';
import * as XLSX from 'xlsx';

/**
 * Admin alumni management service.
 */
export const adminAlumniService = {
  /**
   * List alumni with pagination and filters.
   */
  async list(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
    search?: string;
    tahunLulus?: number;
  }): Promise<{ items: unknown[]; meta: PaginationMeta }> {
    const { items, total } = await alumniRepository.list({
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      search: params.search,
      tahunLulus: params.tahunLulus,
    });

    const meta = buildPaginationMeta(total, {
      page: params.page,
      limit: params.limit,
    });

    return { items, meta };
  },

  /**
   * Get a single alumni by ID.
   */
  async getById(id: number) {
    const alumni = await alumniRepository.findById(id);
    if (!alumni) {
      throw AppError.notFound('Alumni tidak ditemukan');
    }
    return alumni;
  },

  /**
   * Create alumni manually.
   */
  async create(data: { nama_lengkap: string; nim: string; tahun_lulus: number; tanggal_lahir?: string | null }) {
    // Check NIM uniqueness
    const existing = await alumniRepository.findByNim(data.nim);
    if (existing) {
      throw AppError.conflict(`Alumni dengan NIM ${data.nim} sudah terdaftar`);
    }
    return alumniRepository.create(data);
  },

  /**
   * Update alumni by ID.
   */
  async update(id: number, data: Partial<{ nama_lengkap: string; nim: string; tahun_lulus: number; tanggal_lahir: string | null }>) {
    // Check if alumni exists
    const existing = await alumniRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Alumni tidak ditemukan');
    }

    // If NIM is being changed, check uniqueness
    if (data.nim && data.nim !== existing.nim) {
      const nimExists = await alumniRepository.findByNim(data.nim);
      if (nimExists) {
        throw AppError.conflict(`Alumni dengan NIM ${data.nim} sudah terdaftar`);
      }
    }

    // Sinkronisasi tahun lulus ke data survey jika ada
    if (data.tahun_lulus !== undefined && data.tahun_lulus !== existing.tahun_lulus) {
      const existingSurvey = await surveyRepository.findByAlumniId(id);
      if (existingSurvey && existingSurvey.tahun_lulus_konfirmasi !== data.tahun_lulus) {
        await surveyRepository.updateByAlumniId(id, {
          ...existingSurvey,
          tahun_lulus_konfirmasi: data.tahun_lulus as number,
        } as any);
      }
    }

    return alumniRepository.update(id, data);
  },

  /**
   * Delete alumni by ID.
   */
  async delete(id: number) {
    const deleted = await alumniRepository.delete(id);
    if (!deleted) {
      throw AppError.notFound('Alumni tidak ditemukan');
    }
  },

  /**
   * Export all alumni data to Excel.
   */
  async exportExcel(filters?: { tahunLulus?: number }): Promise<Buffer> {
    const rows = await alumniRepository.listAll(filters);

    const data = rows.map((row, index) => ({
      'No': index + 1,
      'Nama Lengkap': row.nama_lengkap,
      'NIM': row.nim,
      'Tahun Lulus': row.tahun_lulus,
      'Tanggal Lahir': row.tanggal_lahir ? new Date(row.tanggal_lahir).toLocaleDateString('id-ID') : '-',
      'Tanggal Ditambahkan': new Date(row.created_at).toLocaleDateString('id-ID'),
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Alumni');

    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  },
};
