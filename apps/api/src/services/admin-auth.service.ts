import bcrypt from 'bcrypt';
import { adminRepository } from '../repositories/admin.repository';
import { AppError } from '../utils/app-error';

/**
 * Admin authentication service.
 */
export const adminAuthService = {
  /**
   * Authenticate admin with username and password.
   * Returns admin data (without password_hash) on success.
   */
  async login(username: string, password: string) {
    const admin = await adminRepository.findByUsername(username);
    if (!admin) {
      throw AppError.unauthorized('Username atau password salah');
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      throw AppError.unauthorized('Username atau password salah');
    }

    // Return safe admin data
    return {
      id: admin.id,
      username: admin.username,
      nama: admin.nama,
    };
  },

  /**
   * Get current admin profile from session.
   */
  async getProfile(adminId: number) {
    const admin = await adminRepository.findById(adminId);
    if (!admin) {
      throw AppError.notFound('Admin tidak ditemukan');
    }
    return {
      id: admin.id,
      username: admin.username,
      nama: admin.nama,
    };
  },

  async updateProfile(id: number, nama: string, username: string) {
    // Check if the username is taken by another admin
    const existing = await adminRepository.findByUsername(username);
    if (existing && existing.id !== id) {
      throw AppError.badRequest('Username sudah digunakan oleh admin lain');
    }
    await adminRepository.updateProfile(id, nama, username);
  },

  async updatePassword(id: number, oldPassword: string, newPassword: string) {
    const admin = await adminRepository.findById(id);
    if (!admin) {
      throw AppError.notFound('Admin tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!isMatch) {
      throw AppError.badRequest('Password lama salah');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await adminRepository.updatePassword(id, newPasswordHash);
  },
};
