import express from 'express';
import { register, login, registerValidators, me } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerValidators, register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

export default router;
