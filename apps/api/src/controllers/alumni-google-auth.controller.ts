import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { asyncHandler } from '../utils/async-handler';
import { alumniRepository } from '../repositories/alumni.repository';
import { surveyService } from '../services/survey.service';
import { sendSuccess } from '../utils/api-response';
import { AppError } from '../utils/app-error';
import { env } from '../config/env';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Public alumni Google authentication controller.
 * Verifies Google ID token, extracts email, and matches to alumni by NIM.
 * 
 * For UMS students, email format is: a710xxxxxx@student.ums.ac.id
 * The NIM is extracted from the email prefix (e.g., "a710180052").
 */
export const alumniGoogleAuthController = {
  loginWithGoogle: asyncHandler(async (req: Request, res: Response) => {
    const { credential } = req.body as { credential: string };

    if (!credential) {
      throw AppError.badRequest('Google credential is required');
    }

    // Verify the Google ID token
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw AppError.unauthorized('Token Google tidak valid');
    }

    if (!payload || !payload.email) {
      throw AppError.unauthorized('Email tidak ditemukan dari akun Google');
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || '';

    // Strategy 1: Find by exact email
    let alumni = await alumniRepository.findByEmail(email);

    // Strategy 2: If not found, try to extract NIM from @student.ums.ac.id
    if (!alumni && (email.endsWith('@student.ums.ac.id') || email.endsWith('@ums.ac.id'))) {
      const nimCandidate = email.split('@')[0].toUpperCase();
      alumni = await alumniRepository.findByNim(nimCandidate);
    }

    // Strategy 3: Try searching by exact name
    if (!alumni && name) {
      const searchResult = await alumniRepository.search(name, 1, 'nama_lengkap', 'asc');
      if (searchResult.items.length === 1 && searchResult.items[0].nama_lengkap.toLowerCase() === name.toLowerCase()) {
        alumni = searchResult.items[0];
      }
    }

    // If still not found, return needs_registration
    if (!alumni) {
      return sendSuccess(res, {
        verified: false,
        needs_registration: true,
        google_email: email,
        google_name: name,
        message: 'Akun Google belum terhubung. Silakan verifikasi data Anda.',
      }, 'Alumni tidak ditemukan');
    }

    // If found but email is empty in db, link it
    if (!(alumni as any).email) {
      await alumniRepository.updateEmail(alumni.id, email);
    }

    // Check survey status
    const { survey_exists } = await surveyService.checkStatus(alumni.id);

    sendSuccess(res, {
      verified: true,
      alumni: {
        id: alumni.id,
        nama_lengkap: alumni.nama_lengkap,
        nim: alumni.nim,
        tahun_lulus: alumni.tahun_lulus,
      },
      survey_exists,
      google_email: email,
    }, 'Login berhasil');
  }),

  registerWithGoogle: asyncHandler(async (req: Request, res: Response) => {
    const { credential, nim } = req.body;

    if (!credential || !nim) {
      throw AppError.badRequest('Credential dan NIM wajib diisi');
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw AppError.unauthorized('Token Google tidak valid');
    }

    if (!payload || !payload.email) {
      throw AppError.unauthorized('Email tidak ditemukan dari akun Google');
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || '';
    const upperNim = nim.toUpperCase();

    // Check if alumni with this NIM exists
    let alumni = await alumniRepository.findByNim(upperNim);

    if (alumni) {
      // Update email without verifying birth date
      await alumniRepository.updateEmail(alumni.id, email);
    } else {
      // If not exists, create new alumni record
      alumni = await alumniRepository.create({
        nim: upperNim,
        nama_lengkap: name,
        email,
      });
    }

    // Check survey status
    const { survey_exists } = await surveyService.checkStatus(alumni.id);

    sendSuccess(res, {
      verified: true,
      alumni: {
        id: alumni.id,
        nama_lengkap: alumni.nama_lengkap,
        nim: alumni.nim,
        tahun_lulus: alumni.tahun_lulus,
      },
      survey_exists,
      google_email: email,
    }, 'Berhasil menghubungkan akun');
  }),
};
