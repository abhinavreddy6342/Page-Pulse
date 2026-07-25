import express from 'express';
import { saveReport, listReports, getReport, deleteReport } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, saveReport);
router.get('/', authMiddleware, listReports);
router.get('/:id', authMiddleware, getReport);
router.delete('/:id', authMiddleware, deleteReport);

export default router;
