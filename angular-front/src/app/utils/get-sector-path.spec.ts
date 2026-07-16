import { getSectorPath } from './get-sector-path';
import { Sector } from '../models/sector.model';

describe('getSectorPath', () => {
  const sectors: Sector[] = [
    { id: '1', name: 'Manufacturing', parentId: null },
    { id: '2', name: 'Food and Beverage', parentId: '1' },
    { id: '3', name: 'Meat products', parentId: '2' },
    { id: '4', name: 'Service', parentId: null },
  ];

  it('builds a root-to-leaf path of names', () => {
    expect(getSectorPath('3', sectors)).toEqual([
      'Manufacturing',
      'Food and Beverage',
      'Meat products',
    ]);
  });

  it('returns a single name for a root sector', () => {
    expect(getSectorPath('4', sectors)).toEqual(['Service']);
  });

  it('returns an empty path for an unknown id', () => {
    expect(getSectorPath('missing', sectors)).toEqual([]);
  });
});
