import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

/**
 * Admin session guard.
 * Checks that the request has a valid admin session.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session || !req.session.admin_id) {
    next(AppError.unauthorized('Login diperlukan untuk mengakses resource ini'));
    return;
  }
  next();
}
