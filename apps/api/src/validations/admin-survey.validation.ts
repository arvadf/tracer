import { z } from 'zod';
import { STATUS_PEKERJAAN, PAGINATION_DEFAULTS, YEAR_RANGE } from '../constants';

/**
 * Admin survey list query params.
 */
export const adminSurveyListSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_DEFAULTS.PAGE).optional(),
  limit: z.coerce.number().int().min(1).max(PAGINATION_DEFAULTS.MAX_LIMIT).default(PAGINATION_DEFAULTS.LIMIT).optional(),
  sort_by: z.enum(['nama_lengkap', 'tahun_lulus_konfirmasi', 'status_pekerjaan', 'created_at']).default('created_at').optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc').optional(),
  search: z.string().optional(),
  tahun_lulus: z.coerce.number().int().min(YEAR_RANGE.MIN).max(YEAR_RANGE.MAX).optional(),
  status_pekerjaan: z.enum(STATUS_PEKERJAAN).optional(),
  lanjut_ppg: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  status_pengisian: z.enum(['sudah', 'belum']).optional(),
});

export type AdminSurveyListInput = z.infer<typeof adminSurveyListSchema>;

/**
 * Admin survey export query params.
 */
export const adminSurveyExportSchema = z.object({
  tahun_lulus: z.coerce.number().int().min(YEAR_RANGE.MIN).max(YEAR_RANGE.MAX).optional(),
  status_pekerjaan: z.enum(STATUS_PEKERJAAN).optional(),
  lanjut_ppg: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});

export type AdminSurveyExportInput = z.infer<typeof adminSurveyExportSchema>;

/**
 * Admin survey ID param.
 */
export const adminSurveyIdSchema = z.object({
  id: z.coerce.number().int().positive('ID harus positif'),
});

export type AdminSurveyIdParam = z.infer<typeof adminSurveyIdSchema>;
