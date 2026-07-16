import { Sector, SectorNode } from '../models/sector.model';

/**
 * Turns the flat API list (id + parentId) into a forest of SectorNodes.
 * Parents become structural nodes (isLeaf = false); leaves are selectable.
 * At every level, non-leaf nodes (nodes with children) are ordered before leaves.
 */
export function buildSectorTree(sectors: Sector[]): SectorNode[] {
  const map = new Map<string, SectorNode>();

  for (const sector of sectors) {
    map.set(sector.id, {
      id: sector.id,
      name: sector.name,
      children: [],
      isLeaf: true,
    });
  }

  const roots: SectorNode[] = [];

  for (const sector of sectors) {
    const node = map.get(sector.id)!;

    if (sector.parentId && map.has(sector.parentId)) {
      const parent = map.get(sector.parentId)!;
      parent.children.push(node);
      parent.isLeaf = false;
    } else {
      roots.push(node);
    }
  }

  return sortParentsFirst(roots);
}

/** Parents first (A–Z), then leaves (A–Z); children sorted the same way. */
function sortParentsFirst(nodes: SectorNode[]): SectorNode[] {
  const sorted = [...nodes].sort((a, b) => {
    if (a.isLeaf !== b.isLeaf) {
      return a.isLeaf ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  for (const node of sorted) {
    if (node.children.length > 0) {
      node.children = sortParentsFirst(node.children);
    }
  }

  return sorted;
}
