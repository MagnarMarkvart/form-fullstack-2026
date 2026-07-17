import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';
import { validateSaveUserData } from './validate-save-user.js';

type UserRow = {
  id: string;
  name: string;
  agreeToTerms: number;
  createdAt: string;
};

type UserRecord = {
  id: string;
  name: string;
  selectedSectorIds: string[];
  agreeToTerms: boolean;
  createdAt: string;
};

function toUserRecord(row: UserRow): UserRecord {
  return {
    ...row,
    selectedSectorIds: (
      db
        .prepare(
          'SELECT sectorId FROM user_sectors WHERE userId = ? ORDER BY sectorId',
        )
        .all(row.id) as { sectorId: string }[]
    ).map((selection) => selection.sectorId),
    agreeToTerms: row.agreeToTerms === 1,
  };
}

function getUser(id: string): UserRecord | null {
  const row = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(id) as UserRow | undefined;
  return row ? toUserRecord(row) : null;
}

export const resolvers = {
  Query: {
    sectors: () => db.prepare('SELECT id, name, parentId FROM sectors').all(),
    sessionUser: (_: unknown, { id }: { id: string }) => getUser(id),
  },
  Mutation: {
    saveUserData: (
      _: unknown,
      {
        id,
        name,
        selectedSectorIds,
        agreeToTerms,
      }: {
        id?: string | null;
        name: string;
        selectedSectorIds: string[];
        agreeToTerms: boolean;
      },
    ) => {
      const validated = validateSaveUserData({
        name,
        selectedSectorIds,
        agreeToTerms,
      });

      if (id) {
        const existing = db
          .prepare('SELECT * FROM users WHERE id = ?')
          .get(id) as UserRow | undefined;

        if (existing) {
          db.transaction(() => {
            db.prepare(
              `UPDATE users
               SET name = ?, agreeToTerms = ?
               WHERE id = ?`,
            ).run(validated.name, 1, id);
            db.prepare('DELETE FROM user_sectors WHERE userId = ?').run(id);
            const insertSelection = db.prepare(
              'INSERT INTO user_sectors (userId, sectorId) VALUES (?, ?)',
            );
            for (const sectorId of validated.selectedSectorIds) {
              insertSelection.run(id, sectorId);
            }
          })();

          return getUser(id)!;
        }
      }

      const user: UserRecord = {
        id: uuidv4(),
        name: validated.name,
        selectedSectorIds: validated.selectedSectorIds,
        agreeToTerms: true,
        createdAt: new Date().toISOString(),
      };

      db.transaction(() => {
        db.prepare(
          'INSERT INTO users (id, name, agreeToTerms, createdAt) VALUES (?, ?, ?, ?)',
        ).run(user.id, user.name, 1, user.createdAt);
        const insertSelection = db.prepare(
          'INSERT INTO user_sectors (userId, sectorId) VALUES (?, ?)',
        );
        for (const sectorId of user.selectedSectorIds) {
          insertSelection.run(user.id, sectorId);
        }
      })();

      return user;
    },
    deleteUserData: (_: unknown, { id }: { id: string }) => {
      const existing = db
        .prepare('SELECT id FROM users WHERE id = ?')
        .get(id) as { id: string } | undefined;

      if (!existing) {
        return false;
      }

      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      return true;
    },
  },
};
