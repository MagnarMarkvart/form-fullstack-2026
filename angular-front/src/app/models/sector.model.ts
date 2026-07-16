export interface Sector {
  id: string;
  name: string;
  parentId: string | null;
}

export interface SectorNode {
  id: string;
  name: string;
  children: SectorNode[];
  isLeaf: boolean;
}
