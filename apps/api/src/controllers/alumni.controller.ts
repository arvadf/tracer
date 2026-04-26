import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { alumniService } from '../services/alumni.service';
import { surveyService } from '../services/survey.service';
import { sendSuccess, sendPaginated } from '../utils/api-response';
import { buildPaginationMeta } from '../utils/pagination';
import { SEARCH_DEFAULTS } from '../constants';

/**
 * Public alumni controller.
 */
export const alumniController = {
  /**
   * GET /api/v1/alumni/search
   */
  search: asyncHandler(async (req: Request, res: Response) => {
    const { query, limit, sort_by, sort_order } = req.query as {
      query: string;
      limit?: string;
      sort_by?: string;
      sort_order?: string;
    };

    const parsedLimit = Math.min(parseInt(limit || String(SEARCH_DEFAULTS.DEFAULT_LIMIT), 10), SEARCH_DEFAULTS.MAX_LIMIT);

    const result = await alumniService.search(
      query,
      parsedLimit,
      sort_by || 'nama_lengkap',
      sort_order || 'asc'
    );

    const meta = buildPaginationMeta(result.total, { page: 1, limit: parsedLimit });

    sendPaginated(res, result.items, meta, 'Hasil pencarian alumni');
  }),

  /**
   * POST /api/v1/alumni/:alumni_id/verify
   * Body: { tanggal_lahir: "YYYY-MM-DD" }
   * Returns: { verified: boolean, survey_exists: boolean }
   */
  verify: asyncHandler(async (req: Request, res: Response) => {
    const alumniId = parseInt(String(req.params.alumni_id), 10);
    const { tanggal_lahir } = req.body as { tanggal_lahir: string };

    if (!tanggal_lahir) {
      return sendSuccess(res, { verified: false, survey_exists: false }, 'Tanggal lahir wajib diisi');
    }

    const { verified, reason } = await alumniService.verifyIdentity(alumniId, tanggal_lahir);

    if (!verified) {
      return sendSuccess(res, { verified: false, survey_exists: false }, reason || 'Tanggal lahir tidak tepat');
    }

    // If verified, also check survey status
    const { survey_exists } = await surveyService.checkStatus(alumniId);

    sendSuccess(res, { verified: true, survey_exists }, 'Verifikasi berhasil');
  }),
};
