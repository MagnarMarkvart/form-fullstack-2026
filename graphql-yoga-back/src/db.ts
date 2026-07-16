import Database from 'better-sqlite3';
import { sectors } from './data/sectors.js';

export const db = new Database('app.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS sectors (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parentId TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    selectedSectorIds TEXT NOT NULL,
    agreeToTerms     INTEGER NOT NULL,
    createdAt        TEXT NOT NULL
  );
`);

const sectorCount = (db.prepare('SELECT COUNT(*) as count FROM sectors').get() as { count: number }).count;
if (sectorCount === 0) {
  const insert = db.prepare('INSERT INTO sectors (id, name, parentId) VALUES (?, ?, ?)');
  const insertAll = db.transaction(() => {
    for (const s of sectors) {
      insert.run(s.id, s.name, s.parentId ?? null);
    }
  });
  insertAll();
}
