import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, '..');
const repoRoot = join(backendRoot, '..');

const db = new Database(join(backendRoot, 'app.db'), { readonly: true });

// --- schema dump ---
const tables = (
  db
    .prepare(
      `SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL ORDER BY name`,
    )
    .all() as { sql: string }[]
).map((r) => r.sql + ';');

const schema = tables.join('\n\n') + '\n';

// --- data dump ---
const lines: string[] = [];

for (const { name } of db
  .prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .all() as { name: string }[]) {
  const rows = db.prepare(`SELECT * FROM ${name}`).all() as Record<
    string,
    unknown
  >[];
  if (rows.length === 0) continue;

  lines.push(`-- ${name}`);
  const cols = Object.keys(rows[0]);
  for (const row of rows) {
    const vals = cols.map((c) => {
      const v = row[c];
      return v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;
    });
    lines.push(
      `INSERT INTO ${name} (${cols.join(', ')}) VALUES (${vals.join(', ')});`,
    );
  }
  lines.push('');
}

const dump = lines.join('\n');

// Keep copies in the backend package and at the repo root.
for (const dir of [backendRoot, repoRoot]) {
  writeFileSync(join(dir, 'schema.sql'), schema);
  writeFileSync(join(dir, 'dump.sql'), dump);
}

console.log('schema.sql and dump.sql written to graphql-yoga-back/ and repo root');

db.close();
