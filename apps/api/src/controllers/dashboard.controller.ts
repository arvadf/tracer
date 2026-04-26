import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/api-response';

/**
 * Dashboard controller.
 */
export const dashboardController = {
  /**
   * GET /api/v1/admin/dashboard/charts
   */
  getCharts: asyncHandler(async (_req: Request, res: Response) => {
    const data = await dashboardService.getCharts();
    sendSuccess(res, data, 'Dashboard chart data');
  }),
};
