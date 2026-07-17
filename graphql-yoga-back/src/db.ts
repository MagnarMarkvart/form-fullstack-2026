import Database from 'better-sqlite3';
import { sectors } from './data/sectors.js';

export const db = new Database('app.db');

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS sectors (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parentId TEXT
  );
    CREATE TABLE IF NOT EXISTS users (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      agreeToTerms INTEGER NOT NULL CHECK (agreeToTerms IN (0, 1)),
      createdAt    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_sectors (
      userId   TEXT NOT NULL,
      sectorId TEXT NOT NULL,
      PRIMARY KEY (userId, sectorId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (sectorId) REFERENCES sectors(id)
    );
  `);

const sectorCount = (
  db.prepare('SELECT COUNT(*) as count FROM sectors').get() as { count: number }
).count;

if (sectorCount === 0) {
  const insert = db.prepare(
    'INSERT INTO sectors (id, name, parentId) VALUES (?, ?, ?)',
  );
  db.transaction(() => {
    for (const sector of sectors) {
      insert.run(sector.id, sector.name, sector.parentId);
    }
  })();
}
