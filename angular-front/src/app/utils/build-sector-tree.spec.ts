import { buildSectorTree } from './build-sector-tree';
import { Sector } from '../models/sector.model';

describe('buildSectorTree', () => {
  const sectors: Sector[] = [
    { id: '1', name: 'Zebra Root', parentId: null },
    { id: '2', name: 'Alpha Root', parentId: null },
    { id: '3', name: 'Branch', parentId: '2' },
    { id: '4', name: 'Leaf B', parentId: '3' },
    { id: '5', name: 'Leaf A', parentId: '3' },
    { id: '6', name: 'Root Leaf', parentId: '2' },
  ];

  it('builds a forest from a flat unsorted list', () => {
    const tree = buildSectorTree(sectors);

    expect(tree.map((n) => n.id)).toEqual(['2', '1']);
    const alpha = tree[0];
    expect(alpha.isLeaf).toBe(false);
    expect(alpha.children.map((n) => n.id)).toEqual(['3', '6']);
  });

  it('marks parents as non-leaves and leaves as selectable leaves', () => {
    const tree = buildSectorTree(sectors);
    const branch = tree[0].children.find((n) => n.id === '3')!;

    expect(branch.isLeaf).toBe(false);
    expect(branch.children.every((c) => c.isLeaf)).toBe(true);
    expect(branch.children.map((c) => c.name)).toEqual(['Leaf A', 'Leaf B']);
  });

  it('sorts branches before leaves alphabetically at each level', () => {
    const tree = buildSectorTree([
      { id: 'r', name: 'Root', parentId: null },
      { id: 'l', name: 'Apple Leaf', parentId: 'r' },
      { id: 'b', name: 'Zebra Branch', parentId: 'r' },
      { id: 'c', name: 'Child', parentId: 'b' },
    ]);

    expect(tree[0].children.map((n) => n.name)).toEqual([
      'Zebra Branch',
      'Apple Leaf',
    ]);
  });

  it('returns an empty forest for an empty list', () => {
    expect(buildSectorTree([])).toEqual([]);
  });
});
