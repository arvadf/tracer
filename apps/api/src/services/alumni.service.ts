import { alumniRepository } from '../repositories/alumni.repository';
import { AppError } from '../utils/app-error';

/**
 * Public alumni service - search, lookup, and identity verification.
 */
export const alumniService = {
  /**
   * Search alumni by name or NIM (public autocomplete).
   */
  async search(query: string, limit: number, sortBy: string, sortOrder: string) {
    return alumniRepository.search(query, limit, sortBy, sortOrder);
  },

  /**
   * Get alumni by ID or throw 404.
   */
  async getById(id: number) {
    const alumni = await alumniRepository.findById(id);
    if (!alumni) {
      throw AppError.notFound('Alumni tidak ditemukan');
    }
    return alumni;
  },

  /**
   * Verify alumni identity by matching tanggal_lahir.
   * Returns verified status and reason for failure.
   */
  async verifyIdentity(alumniId: number, tanggalLahir: string): Promise<{ verified: boolean; reason?: string }> {
    const alumni = await alumniRepository.findById(alumniId);
    if (!alumni) {
      throw AppError.notFound('Alumni tidak ditemukan');
    }

    // If alumni has no birth date stored, reject verification
    if (!alumni.tanggal_lahir) {
      return { verified: false, reason: 'Data tanggal lahir belum terdaftar. Hubungi admin PTI UMS.' };
    }

    const matched = await alumniRepository.verifyBirthDate(alumniId, tanggalLahir);
    if (!matched) {
      return { verified: false, reason: 'Tanggal lahir tidak tepat' };
    }

    return { verified: true };
  },
};
