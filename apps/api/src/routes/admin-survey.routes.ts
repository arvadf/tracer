import { Router } from 'express';
import { adminSurveyController } from '../controllers/admin-survey.controller';
import { validate } from '../middlewares/validate.middleware';
import { requireAdmin } from '../middlewares/auth-admin.middleware';
import { adminSurveyIdSchema, adminSurveyListSchema, adminSurveyExportSchema } from '../validations/admin-survey.validation';
import { importConfirmSchema } from '../validations/import.validation';
import { surveyBodySchema } from '../validations/survey.validation';
import multer from 'multer';

const router = Router();

// Multer for file upload (memory storage for buffer access)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel (.xlsx, .xls) yang diperbolehkan'));
    }
  },
});

// All admin survey routes require authentication
router.use(requireAdmin);

// --- Survey Management ---
router.get('/', validate(adminSurveyListSchema, 'query'), adminSurveyController.list);
router.get('/export', validate(adminSurveyExportSchema, 'query'), adminSurveyController.export);

// --- Import ---
router.post('/import', upload.single('file'), adminSurveyController.importPreview);
router.post('/import/confirm', validate(importConfirmSchema, 'body'), adminSurveyController.importConfirm);

router.get('/:id', validate(adminSurveyIdSchema, 'params'), adminSurveyController.getById);
router.put('/:id', validate(adminSurveyIdSchema, 'params'), validate(surveyBodySchema, 'body'), adminSurveyController.update);
router.delete('/:id', validate(adminSurveyIdSchema, 'params'), adminSurveyController.delete);

export default router;
