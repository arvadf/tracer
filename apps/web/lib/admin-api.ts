// =============================================
// Admin API helpers & types
// =============================================

import { api, ApiError } from './api';
import type {
  ApiSuccessResponse,
  ApiPaginatedData,
  PaginationMeta,
  Alumni,
  Survey,
  ChartDataPoint,
} from './types';

// --- Admin Types ---
export interface AdminUser {
  id: number;
  username: string;
  nama: string;
}

export interface AdminUpdateProfileData {
  nama: string;
  username: string;
}

export interface AdminUpdatePasswordData {
  old_password: string;
  new_password: string;
}

export interface DashboardData {
  summary: {
    total_alumni: number;
    total_surveys: number;
    belum_mengisi: number;
    response_rate: number;
  };
  status_pekerjaan: ChartDataPoint[];
  universitas_ppg: ChartDataPoint[];
  universitas_s2s3: ChartDataPoint[];
  jurusan_s2s3: ChartDataPoint[];
  ppg_distribution: ChartDataPoint[];
  s2s3_distribution: ChartDataPoint[];
  tahun_lulus: ChartDataPoint[];
}

export interface SurveyWithAlumni extends Survey {
  nama_lengkap: string;
  nim: string;
  tahun_lulus: number;
}

export interface ImportPreviewResult {
  import_id: string;
  total_valid: number;
  total_invalid: number;
  invalid_rows: Array<{
    row_number: number;
    nama_lengkap: string;
    nim: string;
    tahun_lulus: number;
    is_valid: boolean;
    errors: string[];
  }>;
}

export interface ImportConfirmResult {
  import_id: string;
  total_processed: number;
  inserted: number;
  skipped: number;
}

// --- Admin Auth ---
export const adminApi = {
  login: (username: string, password: string) =>
    api.post<ApiSuccessResponse<AdminUser>>('/admin/auth/login', { username, password }),

  logout: () =>
    api.post<ApiSuccessResponse<null>>('/admin/auth/logout'),

  me: () =>
    api.get<ApiSuccessResponse<AdminUser>>('/admin/auth/me'),

  updateProfile: (data: AdminUpdateProfileData) =>
    api.put<ApiSuccessResponse<null>>('/admin/auth/profile', data),

  updatePassword: (data: AdminUpdatePasswordData) =>
    api.put<ApiSuccessResponse<null>>('/admin/auth/password', data),

  // --- Dashboard ---
  getDashboard: () =>
    api.get<ApiSuccessResponse<DashboardData>>('/admin/dashboard/charts'),

  // --- Alumni Management ---
  listAlumni: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tahun_lulus?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.tahun_lulus) query.set('tahun_lulus', String(params.tahun_lulus));
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    if (params?.sort_order) query.set('sort_order', params.sort_order);
    return api.get<ApiSuccessResponse<ApiPaginatedData<Alumni>>>(`/admin/alumni?${query.toString()}`);
  },

  getAlumni: (id: number) =>
    api.get<ApiSuccessResponse<Alumni>>(`/admin/alumni/${id}`),

  createAlumni: (data: { nama_lengkap: string; nim: string; tahun_lulus: number; tanggal_lahir?: string | null }) =>
    api.post<ApiSuccessResponse<Alumni>>('/admin/alumni', data),

  deleteAlumni: (id: number) =>
    api.del<ApiSuccessResponse<null>>(`/admin/alumni/${id}`),

  updateAlumni: (id: number, data: { nama_lengkap?: string; nim?: string; tahun_lulus?: number | null; tanggal_lahir?: string | null }) =>
    api.put<ApiSuccessResponse<Alumni>>(`/admin/alumni/${id}`, data),

  importAlumni: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<ApiSuccessResponse<ImportPreviewResult>>('/admin/alumni/import', formData);
  },

  confirmImport: (importId: string) =>
    api.post<ApiSuccessResponse<ImportConfirmResult>>('/admin/alumni/import/confirm', { import_id: importId }),

  exportAlumni: (params?: { tahun_lulus?: number }) => {
    const query = new URLSearchParams();
    if (params?.tahun_lulus) query.set('tahun_lulus', String(params.tahun_lulus));
    return api.get<Blob>(`/admin/alumni/export?${query.toString()}`);
  },

  // --- Survey Management ---
  listSurveys: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tahun_lulus?: number;
    status_pekerjaan?: string;
    lanjut_ppg?: string;
    status_pengisian?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.tahun_lulus) query.set('tahun_lulus', String(params.tahun_lulus));
    if (params?.status_pekerjaan) query.set('status_pekerjaan', params.status_pekerjaan);
    if (params?.lanjut_ppg) query.set('lanjut_ppg', params.lanjut_ppg);
    if (params?.status_pengisian) query.set('status_pengisian', params.status_pengisian);
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    if (params?.sort_order) query.set('sort_order', params.sort_order);
    return api.get<ApiSuccessResponse<ApiPaginatedData<SurveyWithAlumni>>>(`/admin/surveys?${query.toString()}`);
  },

  getSurveyDetail: (id: number) =>
    api.get<ApiSuccessResponse<SurveyWithAlumni>>(`/admin/surveys/${id}`),

  updateSurvey: (id: number, data: any) =>
    api.put<ApiSuccessResponse<SurveyWithAlumni>>(`/admin/surveys/${id}`, data),

  deleteSurvey: (id: number) =>
    api.del<ApiSuccessResponse<null>>(`/admin/surveys/${id}`),

  exportSurveys: (params?: { tahun_lulus?: number; status_pekerjaan?: string; lanjut_ppg?: string }) => {
    const query = new URLSearchParams();
    if (params?.tahun_lulus) query.set('tahun_lulus', String(params.tahun_lulus));
    if (params?.status_pekerjaan) query.set('status_pekerjaan', params.status_pekerjaan);
    if (params?.lanjut_ppg) query.set('lanjut_ppg', params.lanjut_ppg);
    return api.get<Blob>(`/admin/surveys/export?${query.toString()}`);
  },

  importSurveys: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<ApiSuccessResponse<ImportPreviewResult>>('/admin/surveys/import', formData);
  },

  confirmImportSurveys: (importId: string) =>
    api.post<ApiSuccessResponse<ImportConfirmResult>>('/admin/surveys/import/confirm', { import_id: importId }),

};

export { ApiError };
