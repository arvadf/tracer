import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { adminAlumniService } from '../services/admin-alumni.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/api-response';
import { PAGINATION_DEFAULTS } from '../constants';
import { AdminAlumniListInput } from '../validations/admin-alumni.validation';

/**
 * Admin alumni management controller.
 */
export const adminAlumniController = {
  /**
   * GET /api/v1/admin/alumni
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as AdminAlumniListInput;

    const result = await adminAlumniService.list({
      page: query.page!,
      limit: query.limit!,
      sortBy: query.sort_by!,
      sortOrder: query.sort_order!,
      search: query.search,
      tahunLulus: query.tahun_lulus,
    });

    sendPaginated(res, result.items as unknown[], result.meta, 'Daftar alumni');
  }),

  /**
   * GET /api/v1/admin/alumni/:id
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const alumni = await adminAlumniService.getById(id);
    sendSuccess(res, alumni, 'Detail alumni');
  }),

  /**
   * POST /api/v1/admin/alumni
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const alumni = await adminAlumniService.create(req.body);
    sendCreated(res, alumni, 'Alumni berhasil ditambahkan');
  }),

  /**
   * PUT /api/v1/admin/alumni/:id
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const alumni = await adminAlumniService.update(id, req.body);
    sendSuccess(res, alumni, 'Alumni berhasil diperbarui');
  }),

  /**
   * DELETE /api/v1/admin/alumni/:id
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    await adminAlumniService.delete(id);
    sendSuccess(res, null, 'Alumni berhasil dihapus');
  }),

  /**
   * GET /api/v1/admin/alumni/export
   */
  exportExcel: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string | undefined>;
    const tahunLulus = query.tahun_lulus ? parseInt(query.tahun_lulus, 10) : undefined;
    
    const buffer = await adminAlumniService.exportExcel({ tahunLulus });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=data-alumni-${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    res.send(buffer);
  }),
};
