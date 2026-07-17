import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { sectors } from '../src/data/sectors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, '..');
const repoRoot = join(backendRoot, '..');

const schema = `CREATE TABLE sectors (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  parentId TEXT
);

CREATE TABLE users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  agreeToTerms INTEGER NOT NULL CHECK (agreeToTerms IN (0, 1)),
  createdAt    TEXT NOT NULL
);

CREATE TABLE user_sectors (
  userId   TEXT NOT NULL,
  sectorId TEXT NOT NULL,
  PRIMARY KEY (userId, sectorId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sectorId) REFERENCES sectors(id)
);
`;

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;
const sectorRows = sectors.map(
  (sector) =>
    `INSERT INTO sectors (id, name, parentId) VALUES (${quote(sector.id)}, ${quote(sector.name)}, ${sector.parentId ? quote(sector.parentId) : 'NULL'});`,
);

const demoRows = [
  `INSERT INTO users (id, name, agreeToTerms, createdAt) VALUES ('demo-single-sector', 'Ava Example', 1, '2026-01-01T00:00:00.000Z');`,
  `INSERT INTO user_sectors (userId, sectorId) VALUES ('demo-single-sector', '342');`,
  `INSERT INTO users (id, name, agreeToTerms, createdAt) VALUES ('demo-multiple-sectors', 'Noah Example', 1, '2026-01-02T00:00:00.000Z');`,
  `INSERT INTO user_sectors (userId, sectorId) VALUES ('demo-multiple-sectors', '269');`,
  `INSERT INTO user_sectors (userId, sectorId) VALUES ('demo-multiple-sectors', '342');`,
  `INSERT INTO user_sectors (userId, sectorId) VALUES ('demo-multiple-sectors', '581');`,
];

const dump = [
  '-- Sector Registration demo database: schema and data',
  '-- This file can be restored directly with sqlite3 app.db < dump.sql.',
  'PRAGMA foreign_keys = OFF;',
  'BEGIN TRANSACTION;',
  'DROP TABLE IF EXISTS user_sectors;',
  'DROP TABLE IF EXISTS users;',
  'DROP TABLE IF EXISTS sectors;',
  '',
  schema.trim(),
  '',
  '-- Canonical sector options from the supplied select element',
  ...sectorRows,
  '',
  '-- Demo registrations: one single-sector user and one multi-sector user',
  ...demoRows,
  'COMMIT;',
  'PRAGMA foreign_keys = ON;',
  '',
].join('\n');

// Keep copies in the backend package and at the repo root.
for (const dir of [backendRoot, repoRoot]) {
  writeFileSync(join(dir, 'schema.sql'), schema);
  writeFileSync(join(dir, 'dump.sql'), dump);
}

console.log('schema.sql and a full, restorable demo dump.sql written to graphql-yoga-back/ and repo root');
