import { surveyRepository } from '../repositories/survey.repository';
import { alumniRepository } from '../repositories/alumni.repository';
import { SurveyInput } from '../types';
import { AppError } from '../utils/app-error';

/**
 * Public survey service - status check, get, create, update.
 */
export const surveyService = {
  /**
   * Check if a survey exists for the given alumni.
   */
  async checkStatus(alumniId: number): Promise<{ survey_exists: boolean }> {
    // Verify alumni exists first
    const alumni = await alumniRepository.findById(alumniId);
    if (!alumni) {
      throw AppError.notFound('Alumni tidak ditemukan');
    }
    const exists = await surveyRepository.existsByAlumniId(alumniId);
    return { survey_exists: exists };
  },

  /**
   * Get existing survey for an alumni.
   */
  async getByAlumniId(alumniId: number) {
    const alumni = await alumniRepository.findById(alumniId);
    if (!alumni) {
      throw AppError.notFound('Alumni tidak ditemukan');
    }

    const survey = await surveyRepository.findByAlumniId(alumniId);
    if (!survey) {
      throw AppError.notFound('Survey belum diisi untuk alumni ini');
    }
    return survey;
  },

  /**
   * Create a new survey (POST). Rejects 409 if already exists.
   */
  async create(alumniId: number, data: SurveyInput) {
    const alumni = await alumniRepository.findById(alumniId);
    if (!alumni) {
      throw AppError.notFound('Alumni tidak ditemukan');
    }

    const exists = await surveyRepository.existsByAlumniId(alumniId);
    if (exists) {
      throw AppError.conflict('Survey sudah pernah diisi untuk alumni ini. Gunakan PUT untuk memperbarui.');
    }

    // Sinkronisasi tahun lulus ke data alumni
    if (data.tahun_lulus_konfirmasi && alumni.tahun_lulus !== data.tahun_lulus_konfirmasi) {
      await alumniRepository.update(alumniId, { tahun_lulus: data.tahun_lulus_konfirmasi });
    }

    return surveyRepository.create(alumniId, data);
  },

  /**
   * Update an existing survey (PUT). Rejects 404 if not exists.
   */
  async update(alumniId: number, data: SurveyInput) {
    const alumni = await alumniRepository.findById(alumniId);
    if (!alumni) {
      throw AppError.notFound('Alumni tidak ditemukan');
    }

    const exists = await surveyRepository.existsByAlumniId(alumniId);
    if (!exists) {
      throw AppError.notFound('Survey belum ada. Gunakan POST untuk membuat survey baru.');
    }

    // Sinkronisasi tahun lulus ke data alumni
    if (data.tahun_lulus_konfirmasi && alumni.tahun_lulus !== data.tahun_lulus_konfirmasi) {
      await alumniRepository.update(alumniId, { tahun_lulus: data.tahun_lulus_konfirmasi });
    }

    return surveyRepository.updateByAlumniId(alumniId, data);
  },
};
