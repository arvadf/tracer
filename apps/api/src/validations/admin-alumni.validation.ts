import { z } from 'zod';
import { PAGINATION_DEFAULTS, YEAR_RANGE } from '../constants';

/**
 * Admin alumni list query params.
 */
export const adminAlumniListSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_DEFAULTS.PAGE).optional(),
  limit: z.coerce.number().int().min(1).max(PAGINATION_DEFAULTS.MAX_LIMIT).default(PAGINATION_DEFAULTS.LIMIT).optional(),
  sort_by: z.enum(['nama_lengkap', 'nim', 'tahun_lulus', 'created_at']).default('created_at').optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc').optional(),
  search: z.string().optional(),
  tahun_lulus: z.coerce.number().int().min(YEAR_RANGE.MIN).max(YEAR_RANGE.MAX).optional(),
});

export type AdminAlumniListInput = z.infer<typeof adminAlumniListSchema>;

/**
 * Admin alumni create body.
 */
export const adminAlumniCreateSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi').transform((v) => v.trim()),
  nim: z.string().min(1, 'NIM wajib diisi').transform((v) => v.trim()),
  tahun_lulus: z.coerce.number().int().min(YEAR_RANGE.MIN).max(YEAR_RANGE.MAX),
});

export type AdminAlumniCreateInput = z.infer<typeof adminAlumniCreateSchema>;

/**
 * Admin alumni update body.
 */
export const adminAlumniUpdateSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi').transform((v) => v.trim()).optional(),
  nim: z.string().min(1, 'NIM wajib diisi').transform((v) => v.trim()).optional(),
  tahun_lulus: z.coerce.number().int().min(YEAR_RANGE.MIN).max(YEAR_RANGE.MAX).optional().nullable(),
  tanggal_lahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional().nullable(),
});

export type AdminAlumniUpdateInput = z.infer<typeof adminAlumniUpdateSchema>;

/**
 * Admin alumni ID param.
 */
export const adminAlumniIdSchema = z.object({
  id: z.coerce.number().int().positive('ID harus positif'),
});

export type AdminAlumniIdParam = z.infer<typeof adminAlumniIdSchema>;
