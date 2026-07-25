import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

const __dirname = path.resolve();
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
export const db = new Low(adapter, { users: [], reports: [] });

// Initialize defaults when first used
export async function initDB() {
  await db.read();
  if (!db.data) {
    db.data = { users: [], reports: [] };
    // Only attempt to write if file doesn't exist yet to avoid rename permission issues
    if (!fs.existsSync(file)) {
      try {
        await db.write();
      } catch (err) {
        console.warn('DB write warning (non-fatal):', err?.message || err);
      }
    }
  }
}
