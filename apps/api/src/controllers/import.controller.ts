import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { importService } from '../services/import.service';
import { sendSuccess, sendCreated } from '../utils/api-response';
import { AppError } from '../utils/app-error';

/**
 * Import controller - Excel upload and confirm.
 */
export const importController = {
  /**
   * POST /api/v1/admin/alumni/import
   * Expects multipart/form-data with a file field named "file".
   */
  upload: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw AppError.badRequest('File Excel wajib diunggah');
    }

    const result = await importService.uploadAndPreview(req.file.buffer);
    sendCreated(res, result, 'Preview import berhasil dibuat');
  }),

  /**
   * POST /api/v1/admin/alumni/import/confirm
   */
  confirm: asyncHandler(async (req: Request, res: Response) => {
    const { import_id } = req.body;
    const result = await importService.confirm(import_id);
    sendSuccess(res, result, 'Import berhasil dikonfirmasi');
  }),
};
