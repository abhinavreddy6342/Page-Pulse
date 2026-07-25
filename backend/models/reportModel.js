import { db, initDB } from './db.js';

export async function createReport(report) {
  await initDB();
  await db.read();
  const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
  const rec = { id, ...report };
  db.data.reports.unshift(rec);
  // keep 1000 reports max
  db.data.reports = db.data.reports.slice(0, 1000);
  await db.write();
  return rec;
}

export async function listReportsByUser(userId, limit = 50) {
  await initDB();
  await db.read();
  return db.data.reports.filter(r => r.userId === userId).slice(0, limit);
}

export async function getReportById(id) {
  await initDB();
  await db.read();
  return db.data.reports.find(r => r.id === id);
}

export async function deleteReportById(id) {
  await initDB();
  await db.read();
  const idx = db.data.reports.findIndex(r => r.id === id);
  if (idx === -1) return false;
  db.data.reports.splice(idx,1);
  await db.write();
  return true;
}
