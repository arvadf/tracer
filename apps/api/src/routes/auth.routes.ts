import { Router } from 'express';
import { alumniGoogleAuthController } from '../controllers/alumni-google-auth.controller';

const router = Router();

// POST /api/v1/auth/google — Verify Google ID token and match to alumni
router.post('/google', alumniGoogleAuthController.loginWithGoogle);

// POST /api/v1/auth/google/link — Link or register an alumni with a Google account
router.post('/google/link', alumniGoogleAuthController.registerWithGoogle);

export default router;
