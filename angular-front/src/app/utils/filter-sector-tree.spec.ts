import { filterSectorTree } from './filter-sector-tree';
import { SectorNode } from '../models/sector.model';

describe('filterSectorTree', () => {
  const tree: SectorNode[] = [
    {
      id: '1',
      name: 'Manufacturing',
      isLeaf: false,
      children: [
        {
          id: '2',
          name: 'Food and Beverage',
          isLeaf: false,
          children: [
            {
              id: '3',
              name: 'Meat products',
              isLeaf: true,
              children: [],
            },
            {
              id: '4',
              name: 'Bakery',
              isLeaf: true,
              children: [],
            },
          ],
        },
        {
          id: '5',
          name: 'Construction Materials',
          isLeaf: true,
          children: [],
        },
      ],
    },
    {
      id: '6',
      name: 'Service',
      isLeaf: false,
      children: [
        {
          id: '7',
          name: 'Consultancy',
          isLeaf: true,
          children: [],
        },
      ],
    },
  ];

  it('returns the original tree when the query is empty or whitespace', () => {
    expect(filterSectorTree(tree, '')).toBe(tree);
    expect(filterSectorTree(tree, '   ')).toBe(tree);
  });

  it('keeps ancestor path when a leaf matches', () => {
    const filtered = filterSectorTree(tree, 'meat');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Manufacturing');
    expect(filtered[0].children).toHaveLength(1);
    expect(filtered[0].children[0].name).toBe('Food and Beverage');
    expect(filtered[0].children[0].children.map((c) => c.name)).toEqual([
      'Meat products',
    ]);
  });

  it('keeps the full subtree when a parent matches', () => {
    const filtered = filterSectorTree(tree, 'food');

    expect(filtered[0].children[0].name).toBe('Food and Beverage');
    expect(filtered[0].children[0].children.map((c) => c.name)).toEqual([
      'Meat products',
      'Bakery',
    ]);
  });

  it('is case-insensitive', () => {
    const filtered = filterSectorTree(tree, 'CONSULT');
    expect(filtered.map((n) => n.name)).toEqual(['Service']);
    expect(filtered[0].children[0].name).toBe('Consultancy');
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterSectorTree(tree, 'xyz')).toEqual([]);
  });
});
