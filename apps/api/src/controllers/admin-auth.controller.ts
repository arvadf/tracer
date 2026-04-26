import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { adminAuthService } from '../services/admin-auth.service';
import { sendSuccess } from '../utils/api-response';

/**
 * Admin authentication controller.
 */
export const adminAuthController = {
  /**
   * POST /api/v1/admin/auth/login
   */
  login: asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const admin = await adminAuthService.login(username, password);

    // Store in session
    req.session.admin_id = admin.id;
    req.session.admin_username = admin.username;

    sendSuccess(res, admin, 'Login berhasil');
  }),

  /**
   * POST /api/v1/admin/auth/logout
   */
  logout: asyncHandler(async (req: Request, res: Response) => {
    return new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
          return;
        }
        res.clearCookie('connect.sid');
        sendSuccess(res, null, 'Logout berhasil');
        resolve();
      });
    });
  }),

  /**
   * GET /api/v1/admin/auth/me
   */
  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.session || !req.session.admin_id) {
      sendSuccess(res, null, 'Not logged in');
      return;
    }
    const adminId = req.session.admin_id!;
    const admin = await adminAuthService.getProfile(adminId);
    sendSuccess(res, admin, 'Data admin');
  }),

  /**
   * PUT /api/v1/admin/auth/profile
   */
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.session.admin_id!;
    const { nama, username } = req.body;
    await adminAuthService.updateProfile(adminId, nama, username);
    
    // Update session data to reflect new username
    req.session.admin_username = username;
    
    sendSuccess(res, null, 'Profil berhasil diperbarui');
  }),

  /**
   * PUT /api/v1/admin/auth/password
   */
  updatePassword: asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.session.admin_id!;
    const { old_password, new_password } = req.body;
    await adminAuthService.updatePassword(adminId, old_password, new_password);
    sendSuccess(res, null, 'Password berhasil diperbarui');
  }),
};
