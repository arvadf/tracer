import { Router } from 'express';
import { alumniController } from '../controllers/alumni.controller';
import { surveyController } from '../controllers/survey.controller';
import { validate } from '../middlewares/validate.middleware';
import { alumniSearchSchema, alumniIdParamSchema } from '../validations/alumni.validation';
import { surveyBodySchema } from '../validations/survey.validation';
import { strictLimiter, searchLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

// --- Public Alumni Search ---
router.get('/search', searchLimiter, validate(alumniSearchSchema, 'query'), alumniController.search);

// --- Birth Date Verification ---
router.post('/:alumni_id/verify', validate(alumniIdParamSchema, 'params'), alumniController.verify);

// --- Survey Status & Data ---
router.get('/:alumni_id/status', validate(alumniIdParamSchema, 'params'), surveyController.checkStatus);
router.get('/:alumni_id/survey', validate(alumniIdParamSchema, 'params'), surveyController.getSurvey);

// --- Survey Submit / Update ---
router.post(
  '/:alumni_id/survey',
  strictLimiter,
  validate(alumniIdParamSchema, 'params'),
  validate(surveyBodySchema, 'body'),
  surveyController.createSurvey
);

router.put(
  '/:alumni_id/survey',
  strictLimiter,
  validate(alumniIdParamSchema, 'params'),
  validate(surveyBodySchema, 'body'),
  surveyController.updateSurvey
);

export default router;
