import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { surveyService } from '../services/survey.service';
import { sendSuccess, sendCreated } from '../utils/api-response';
import { SurveyInput } from '../types';

/**
 * Public survey controller.
 */
export const surveyController = {
  /**
   * GET /api/v1/alumni/:alumni_id/status
   */
  checkStatus: asyncHandler(async (req: Request, res: Response) => {
    const alumniId = parseInt(String(req.params.alumni_id), 10);
    const result = await surveyService.checkStatus(alumniId);
    sendSuccess(res, result, 'Status survey alumni');
  }),

  /**
   * GET /api/v1/alumni/:alumni_id/survey
   */
  getSurvey: asyncHandler(async (req: Request, res: Response) => {
    const alumniId = parseInt(String(req.params.alumni_id), 10);
    const survey = await surveyService.getByAlumniId(alumniId);
    sendSuccess(res, survey, 'Data survey alumni');
  }),

  /**
   * POST /api/v1/alumni/:alumni_id/survey
   */
  createSurvey: asyncHandler(async (req: Request, res: Response) => {
    const alumniId = parseInt(String(req.params.alumni_id), 10);
    const data = req.body as SurveyInput;
    const survey = await surveyService.create(alumniId, data);
    sendCreated(res, survey, 'Survey berhasil disimpan');
  }),

  /**
   * PUT /api/v1/alumni/:alumni_id/survey
   */
  updateSurvey: asyncHandler(async (req: Request, res: Response) => {
    const alumniId = parseInt(String(req.params.alumni_id), 10);
    const data = req.body as SurveyInput;
    const survey = await surveyService.update(alumniId, data);
    sendSuccess(res, survey, 'Survey berhasil diperbarui');
  }),
};
