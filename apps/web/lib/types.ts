// =============================================
// TypeScript types mirroring backend API shapes
// =============================================

// --- Enums ---
export const STATUS_PEKERJAAN = [
  'BELUM_BEKERJA',
  'GURU',
  'NON_PENDIDIKAN',
  'MAHASISWA_S2_S3',
  'LAINNYA',
] as const;

export type StatusPekerjaan = (typeof STATUS_PEKERJAAN)[number];

export const STATUS_PEKERJAAN_LABELS: Record<StatusPekerjaan, string> = {
  BELUM_BEKERJA: 'Belum Bekerja',
  GURU: 'Guru',
  NON_PENDIDIKAN: 'Non Pendidikan',
  MAHASISWA_S2_S3: 'Mahasiswa S2/S3',
  LAINNYA: 'Lainnya',
};

// --- Alumni ---
export interface Alumni {
  id: number;
  nama_lengkap: string;
  nim: string;
  tahun_lulus: number;
  tanggal_lahir: string | null;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
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

// --- Pagination ---
export interface PaginationMeta {
  current_page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

// --- API Responses ---
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

// --- Survey Status ---
export interface SurveyStatus {
  survey_exists: boolean;
  alumni: Alumni;
}

// --- Chart ---
export interface ChartDataPoint {
  label: string;
  value: number;
}

// --- Import ---
export interface ImportPreviewRow {
  row_number: number;
  nama_lengkap: string;
  nim: string;
  tahun_lulus: number;
  is_valid: boolean;
  errors: string[];
}

export interface ImportDraft {
  import_id: string;
  valid_rows: Array<{ nama_lengkap: string; nim: string; tahun_lulus: number }>;
  invalid_rows: ImportPreviewRow[];
  total_valid: number;
  total_invalid: number;
  created_at: number;
}
