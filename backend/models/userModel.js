import { db, initDB } from './db.js';
import bcrypt from 'bcrypt';

export async function createUser({ name, email, password }) {
  await initDB();
  await db.read();
  const exists = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error('User already exists');
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8),
    name,
    email: email.toLowerCase(),
    passwordHash: hash,
    createdAt: new Date().toISOString()
  };
  db.data.users.push(user);
  await db.write();
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export async function findUserByEmail(email) {
  await initDB();
  await db.read();
  return db.data.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
}

export async function findUserById(id) {
  await initDB();
  await db.read();
  return db.data.users.find(u => u.id === id);
}

export async function verifyPassword(user, password) {
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}
