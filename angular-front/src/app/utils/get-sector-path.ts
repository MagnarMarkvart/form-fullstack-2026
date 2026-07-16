import { Sector } from '../models/sector.model';

/**
 * Builds a root → leaf path of sector names, e.g.
 * ["Manufacturing", "Food and Beverage", "Meat & meat products"]
 */
export function getSectorPath(sectorId: string, sectors: Sector[]): string[] {
  const byId = new Map(sectors.map((s) => [s.id, s]));
  const path: string[] = [];
  let current = byId.get(sectorId);

  while (current) {
    path.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path;
}
