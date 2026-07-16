import { SectorNode } from '../models/sector.model';

/**
 * Filters a sector tree by name. Keeps a node if it matches, or if any
 * descendant matches (so parent path stays visible). Matching parents keep
 * their full subtree; non-matching parents keep only matching branches.
 */
export function filterSectorTree(
  nodes: SectorNode[],
  query: string,
): SectorNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const filterNode = (node: SectorNode): SectorNode | null => {
    const nameMatches = node.name.toLowerCase().includes(q);
    const filteredChildren = node.children
      .map(filterNode)
      .filter((child): child is SectorNode => child !== null);

    if (nameMatches) {
      return { ...node, children: [...node.children] };
    }

    if (filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
        isLeaf: false,
      };
    }

    return null;
  };

  return nodes
    .map(filterNode)
    .filter((node): node is SectorNode => node !== null);
}
