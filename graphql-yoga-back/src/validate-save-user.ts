import { GraphQLError } from 'graphql';
import { db } from './db.js';

type SectorRow = {
  id: string;
  parentId: string | null;
};

function badInput(message: string): never {
  throw new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT' },
  });
}

/**
 * Domain rules for saveUserData — mirrors the frontend form checks and
 * also rejects unknown / non-leaf sector IDs that a client could forge.
 */
export function validateSaveUserData(input: {
  name: string;
  selectedSectorIds: string[];
  agreeToTerms: boolean;
}): { name: string; selectedSectorIds: string[] } {
  const name = input.name.trim();
  if (!name) {
    badInput('Name is required');
  }

  if (!input.agreeToTerms) {
    badInput('You must agree to the terms');
  }

  const selectedSectorIds = [
    ...new Set(input.selectedSectorIds.map((id) => id.trim()).filter(Boolean)),
  ];

  if (selectedSectorIds.length === 0) {
    badInput('Select at least one sector');
  }

  const placeholders = selectedSectorIds.map(() => '?').join(', ');
  const rows = db
    .prepare(
      `SELECT id, parentId FROM sectors WHERE id IN (${placeholders})`,
    )
    .all(...selectedSectorIds) as SectorRow[];

  if (rows.length !== selectedSectorIds.length) {
    badInput('One or more selected sectors do not exist');
  }

  const parentIdsWithChildren = new Set(
    (
      db
        .prepare(
          `SELECT DISTINCT parentId AS id FROM sectors
           WHERE parentId IS NOT NULL AND parentId IN (${placeholders})`,
        )
        .all(...selectedSectorIds) as { id: string }[]
    ).map((row) => row.id),
  );

  if (selectedSectorIds.some((id) => parentIdsWithChildren.has(id))) {
    badInput('Only leaf sectors can be selected');
  }

  return { name, selectedSectorIds };
}
