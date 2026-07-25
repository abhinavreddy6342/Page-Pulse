import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, verifyPassword, findUserById } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const EXPIRY = '7d';

export const registerValidators = [
  body('name').isLength({ min: 1 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
];

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const { name, email, password } = req.body;
    const user = await createUser({ name, email, password });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: EXPIRY });
    return res.json({ success: true, user, token });
  } catch (err) {
    console.error('Register error', err?.message || err);
    return res.status(400).json({ success: false, message: err?.message || 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const ok = await verifyPassword(user, password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: EXPIRY });
    return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }, token });
  } catch (err) {
    console.error('Login error', err?.message || err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
}

export async function me(req, res) {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed' });
  }
}
