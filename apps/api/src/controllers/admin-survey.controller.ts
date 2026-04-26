import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { adminSurveyService } from '../services/admin-survey.service';
import { sendSuccess, sendPaginated } from '../utils/api-response';
import { PAGINATION_DEFAULTS } from '../constants';
import { AppError } from '../utils/app-error';
import { AdminSurveyListInput, AdminSurveyExportInput } from '../validations/admin-survey.validation';

/**
 * Admin survey management controller.
 */
export const adminSurveyController = {
  /**
   * GET /api/v1/admin/surveys
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as AdminSurveyListInput;

    const result = await adminSurveyService.list({
      page: query.page!,
      limit: query.limit!,
      sortBy: query.sort_by!,
      sortOrder: query.sort_order!,
      search: query.search,
      tahunLulus: query.tahun_lulus,
      statusPekerjaan: query.status_pekerjaan,
      lanjutPpg: query.lanjut_ppg,
      statusPengisian: query.status_pengisian,
    });

    sendPaginated(res, result.items as unknown[], result.meta, 'Daftar survey');
  }),

  /**
   * GET /api/v1/admin/surveys/:id
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const survey = await adminSurveyService.getById(id);
    if (!survey) {
      throw AppError.notFound('Survey tidak ditemukan');
    }
    sendSuccess(res, survey, 'Detail survey');
  }),

  /**
   * PUT /api/v1/admin/surveys/:id
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const survey = await adminSurveyService.update(id, req.body);
    sendSuccess(res, survey, 'Survey berhasil diperbarui');
  }),

  /**
   * DELETE /api/v1/admin/surveys/:id
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    await adminSurveyService.delete(id);
    sendSuccess(res, null, 'Survey berhasil dihapus');
  }),

  /**
   * GET /api/v1/admin/surveys/export
   */
  export: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as AdminSurveyExportInput;

    const buffer = await adminSurveyService.exportExcel({
      tahunLulus: query.tahun_lulus,
      statusPekerjaan: query.status_pekerjaan,
      lanjutPpg: query.lanjut_ppg,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=surveys-export.xlsx');
    res.send(buffer);
  }),

  /**
   * POST /api/v1/admin/surveys/import
   */
  importPreview: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw AppError.badRequest('File Excel wajib diunggah');
    }
    const result = await adminSurveyService.uploadAndPreview(req.file.buffer);
    sendSuccess(res, result, 'Preview import survey berhasil dibuat');
  }),

  /**
   * POST /api/v1/admin/surveys/import/confirm
   */
  importConfirm: asyncHandler(async (req: Request, res: Response) => {
    const { import_id } = req.body;
    if (!import_id) {
      throw AppError.badRequest('import_id dibutuhkan');
    }
    const result = await adminSurveyService.confirmImport(import_id);
    sendSuccess(res, result, 'Import survey berhasil dikonfirmasi');
  }),
};
