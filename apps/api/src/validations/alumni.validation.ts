import { z } from 'zod';
import { SEARCH_DEFAULTS } from '../constants';

/**
 * Public alumni search query params validation.
 */
export const alumniSearchSchema = z.object({
  query: z
    .string({ message: 'Parameter query wajib diisi' })
    .min(SEARCH_DEFAULTS.MIN_QUERY_LENGTH, `Minimal ${SEARCH_DEFAULTS.MIN_QUERY_LENGTH} karakter untuk pencarian`),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(SEARCH_DEFAULTS.MAX_LIMIT)
    .default(SEARCH_DEFAULTS.DEFAULT_LIMIT)
    .optional(),
  sort_by: z.enum(['nama_lengkap', 'tahun_lulus']).default('nama_lengkap').optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc').optional(),
});

export type AlumniSearchInput = z.infer<typeof alumniSearchSchema>;

/**
 * Alumni ID param validation.
 */
export const alumniIdParamSchema = z.object({
  alumni_id: z.coerce
    .number({ message: 'alumni_id harus berupa angka' })
    .int('alumni_id harus bilangan bulat')
    .positive('alumni_id harus positif'),
});

export type AlumniIdParam = z.infer<typeof alumniIdParamSchema>;
