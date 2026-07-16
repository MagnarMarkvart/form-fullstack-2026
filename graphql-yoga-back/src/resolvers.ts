import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';
import { validateSaveUserData } from './validate-save-user.js';

type UserRow = {
  id: string;
  name: string;
  selectedSectorIds: string;
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
    selectedSectorIds: JSON.parse(row.selectedSectorIds),
    agreeToTerms: row.agreeToTerms === 1,
  };
}

export const resolvers = {
  Query: {
    sectors: () => db.prepare('SELECT id, name, parentId FROM sectors').all(),
    sessionUser: (_: unknown, { id }: { id: string }) => {
      const row = db
        .prepare('SELECT * FROM users WHERE id = ?')
        .get(id) as UserRow | undefined;
      return row ? toUserRecord(row) : null;
    },
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
          db.prepare(
            `UPDATE users
             SET name = ?, selectedSectorIds = ?, agreeToTerms = ?
             WHERE id = ?`,
          ).run(
            validated.name,
            JSON.stringify(validated.selectedSectorIds),
            1,
            id,
          );

          return toUserRecord(
            db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow,
          );
        }
      }

      const user: UserRecord = {
        id: uuidv4(),
        name: validated.name,
        selectedSectorIds: validated.selectedSectorIds,
        agreeToTerms: true,
        createdAt: new Date().toISOString(),
      };

      db.prepare(
        'INSERT INTO users (id, name, selectedSectorIds, agreeToTerms, createdAt) VALUES (?, ?, ?, ?, ?)',
      ).run(
        user.id,
        user.name,
        JSON.stringify(user.selectedSectorIds),
        1,
        user.createdAt,
      );

      return user;
    },
  },
};
