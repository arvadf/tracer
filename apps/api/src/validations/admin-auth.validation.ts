import { z } from 'zod';

/**
 * Admin login body validation.
 */
export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const adminUpdateProfileSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi').max(255),
  username: z.string().min(1, 'Username wajib diisi').max(100),
});

export type AdminUpdateProfileInput = z.infer<typeof adminUpdateProfileSchema>;

export const adminUpdatePasswordSchema = z.object({
  old_password: z.string().min(1, 'Password lama wajib diisi'),
  new_password: z.string().min(6, 'Password baru minimal 6 karakter'),
});

export type AdminUpdatePasswordInput = z.infer<typeof adminUpdatePasswordSchema>;
