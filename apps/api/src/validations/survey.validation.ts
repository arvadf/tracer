import { z } from 'zod';
import { STATUS_PEKERJAAN, YEAR_RANGE } from '../constants';

/**
 * Survey submission/update body validation.
 * Mirrors the conditional CHECK constraints in PostgreSQL schema.
 */
export const surveyBodySchema = z
  .object({
    tahun_lulus_konfirmasi: z.coerce
      .number()
      .int('Tahun lulus harus bilangan bulat')
      .min(YEAR_RANGE.MIN, `Tahun lulus minimal ${YEAR_RANGE.MIN}`)
      .max(YEAR_RANGE.MAX, `Tahun lulus maksimal ${YEAR_RANGE.MAX}`),
    status_pekerjaan: z.enum(STATUS_PEKERJAAN, {
      message: `Status pekerjaan harus salah satu dari: ${STATUS_PEKERJAAN.join(', ')}`,
    }),
    nama_instansi: z
      .string()
      .min(1, 'Nama instansi wajib diisi')
      .transform((v) => v.trim()),
    nomor_hp: z
      .string()
      .regex(/^[0-9]{10,15}$/, 'Nomor HP harus 10-15 digit angka'),
    lanjut_s2s3: z.boolean({ message: 'Field lanjut_s2s3 wajib diisi' }),
    jurusan_s2s3: z.string().nullable().default(null),
    universitas_s2s3: z.string().nullable().default(null),
    lanjut_ppg: z.boolean({ message: 'Field lanjut_ppg wajib diisi' }),
    tahun_ppg: z.coerce.number().int().nullable().default(null),
    universitas_ppg: z.string().nullable().default(null),
    pesan_saran: z.string().nullable().default(null),
  })
  .superRefine((data, ctx) => {
    // Conditional S2/S3 validation
    if (data.lanjut_s2s3) {
      if (!data.jurusan_s2s3 || data.jurusan_s2s3.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['jurusan_s2s3'], message: 'Jurusan S2/S3 wajib diisi jika lanjut S2/S3' });
      }
      if (!data.universitas_s2s3 || data.universitas_s2s3.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['universitas_s2s3'], message: 'Universitas S2/S3 wajib diisi jika lanjut S2/S3' });
      }
    } else {
      // Force null when not continuing
      data.jurusan_s2s3 = null;
      data.universitas_s2s3 = null;
    }

    // Conditional PPG validation
    if (data.lanjut_ppg) {
      if (data.tahun_ppg === null || data.tahun_ppg === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['tahun_ppg'], message: 'Tahun PPG wajib diisi jika lanjut PPG' });
      } else if (data.tahun_ppg < YEAR_RANGE.MIN || data.tahun_ppg > YEAR_RANGE.MAX) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['tahun_ppg'], message: `Tahun PPG harus antara ${YEAR_RANGE.MIN}-${YEAR_RANGE.MAX}` });
      }
      if (!data.universitas_ppg || data.universitas_ppg.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['universitas_ppg'], message: 'Universitas PPG wajib diisi jika lanjut PPG' });
      }
    } else {
      // Force null when not continuing
      data.tahun_ppg = null;
      data.universitas_ppg = null;
    }
  });

export type SurveyBodyInput = z.infer<typeof surveyBodySchema>;
