import { describe, expect, it } from 'vitest';
import { exampleOffer } from './flight-offer.fixture';
import { filterOffersByMaxStops } from './flight-offer-filter';

describe('filterOffersByMaxStops', () => {
  it('returns all offers when maxStops is null without mutating source', () => {
    const source = [{ ...exampleOffer, id: 'A', stops: 1 }];
    const result = filterOffersByMaxStops(source, null);
    expect(result).toEqual(source);
    expect(result).not.toBe(source);
  });

  it('filters out offers exceeding maxStops', () => {
    const source = [
      { ...exampleOffer, id: 'A', stops: 0 },
      { ...exampleOffer, id: 'B', stops: 1 },
      { ...exampleOffer, id: 'C', stops: 2 },
    ];
    const result = filterOffersByMaxStops(source, 1);
    expect(result.map((o) => o.id)).toEqual(['A', 'B']);
  });

  it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid maxStops %s',
    (maxStops) => {
      expect(() => filterOffersByMaxStops([], maxStops)).toThrow('Invalid max stops');
    },
  );
});
