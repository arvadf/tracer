import { StatusPekerjaan } from '../constants';

// --- Alumni ---
export interface Alumni {
  id: number;
  nama_lengkap: string;
  nim: string;
  tahun_lulus: number;
  tanggal_lahir: string | null;
  created_at: Date;
  updated_at: Date;
}

// --- Survey ---
export interface Survey {
  id: number;
  alumni_id: number;
  tahun_lulus_konfirmasi: number;
  status_pekerjaan: StatusPekerjaan;
  nama_instansi: string;
  nomor_hp: string;
  lanjut_s2s3: boolean;
  jurusan_s2s3: string | null;
  universitas_s2s3: string | null;
  lanjut_ppg: boolean;
  tahun_ppg: number | null;
  universitas_ppg: string | null;
  pesan_saran: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SurveyInput {
  tahun_lulus_konfirmasi: number;
  status_pekerjaan: StatusPekerjaan;
  nama_instansi: string;
  nomor_hp: string;
  lanjut_s2s3: boolean;
  jurusan_s2s3: string | null;
  universitas_s2s3: string | null;
  lanjut_ppg: boolean;
  tahun_ppg: number | null;
  universitas_ppg: string | null;
  pesan_saran: string | null;
}

// --- Admin ---
export interface Admin {
  id: number;
  username: string;
  password_hash: string;
  nama: string;
  created_at: Date;
}

// --- Pagination ---
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  current_page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

// --- API Response ---
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiPaginatedData<T = unknown> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

// --- Chart ---
export interface ChartDataPoint {
  label: string;
  value: number;
}

// --- Import Excel ---
export interface ImportPreviewRow {
  row_number: number;
  nama_lengkap: string;
  nim: string;
  tahun_lulus: number | null;
  is_valid: boolean;
  errors: string[];
}

export interface ImportDraft {
  import_id: string;
  valid_rows: Array<{ nama_lengkap: string; nim: string; tahun_lulus: number | null; tanggal_lahir: string | null }>;
  invalid_rows: ImportPreviewRow[];
  total_valid: number;
  total_invalid: number;
  created_at: number; // timestamp ms
}

// --- Session ---
declare module 'express-session' {
  interface SessionData {
    admin_id?: number;
    admin_username?: string;
  }
}
