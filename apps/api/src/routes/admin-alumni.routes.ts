import { Router } from 'express';
import multer from 'multer';
import { adminAlumniController } from '../controllers/admin-alumni.controller';
import { importController } from '../controllers/import.controller';
import { validate } from '../middlewares/validate.middleware';
import { requireAdmin } from '../middlewares/auth-admin.middleware';
import { adminAlumniCreateSchema, adminAlumniUpdateSchema, adminAlumniIdSchema, adminAlumniListSchema } from '../validations/admin-alumni.validation';
import { importConfirmSchema } from '../validations/import.validation';

const router = Router();

// All admin alumni routes require authentication
router.use(requireAdmin);

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

// --- CRUD ---
router.get('/', validate(adminAlumniListSchema, 'query'), adminAlumniController.list);
router.get('/export', adminAlumniController.exportExcel);
router.get('/:id', validate(adminAlumniIdSchema, 'params'), adminAlumniController.getById);
router.post('/', validate(adminAlumniCreateSchema, 'body'), adminAlumniController.create);
router.put('/:id', validate(adminAlumniIdSchema, 'params'), validate(adminAlumniUpdateSchema, 'body'), adminAlumniController.update);
router.delete('/:id', validate(adminAlumniIdSchema, 'params'), adminAlumniController.delete);

// --- Excel Import ---
router.post('/import', upload.single('file'), importController.upload);
router.post('/import/confirm', validate(importConfirmSchema, 'body'), importController.confirm);

export default router;
