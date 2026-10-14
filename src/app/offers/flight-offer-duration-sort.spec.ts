import { describe, expect, it } from 'vitest';
import { exampleOffer } from './flight-offer.fixture';
import { sortOffersByDuration } from './flight-offer-duration-sort';

describe('sortOffersByDuration', () => {
  it('sorts by duration then ID without changing source data', () => {
    const source = [
      {
        ...exampleOffer,
        totalPrice: { ...exampleOffer.totalPrice },
        id: 'A',
        durationMinutes: 300,
      },
      {
        ...exampleOffer,
        totalPrice: { ...exampleOffer.totalPrice },
        id: 'C',
        durationMinutes: 120,
      },
      {
        ...exampleOffer,
        totalPrice: { ...exampleOffer.totalPrice },
        id: 'B',
        durationMinutes: 120,
      },
    ];
    const before = structuredClone(source);
    source.forEach(offer => {
      Object.freeze(offer.totalPrice);
      Object.freeze(offer);
    });
    Object.freeze(source);
    const result = sortOffersByDuration(source);
    expect(result.map(offer => offer.id)).toEqual(['B', 'C', 'A']);
    expect(result).not.toBe(source);
    expect(source).toEqual(before);
    expect(sortOffersByDuration([...source].reverse())).toEqual(result);
  });

  it('handles empty input', () => {
    expect(sortOffersByDuration([])).toEqual([]);
  });

  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid duration %s', durationMinutes => {
      expect(() =>
        sortOffersByDuration([
          {
            ...exampleOffer,
            totalPrice: { ...exampleOffer.totalPrice },
            durationMinutes,
          },
        ]),
      ).toThrow('Invalid duration');
    },
  );
});
