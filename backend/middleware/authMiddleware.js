import jwt from 'jsonwebtoken';
import { findUserById } from '../models/userModel.js';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function authMiddleware(req, res, next) {
  const h = req.headers.authorization || '';
  const parts = h.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    const user = await findUserById(payload.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (err) {
    console.error('Auth verify error', err?.message || err);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}
