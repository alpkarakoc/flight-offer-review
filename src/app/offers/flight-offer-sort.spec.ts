import { describe, expect, it } from 'vitest';
import { exampleOffer } from './flight-offer.fixture';
import type { FlightOffer, Money } from './flight-offer';
import { sortOffersByPrice } from './flight-offer-sort';

const offer = (
  id: string, amountMinor: number, currency: Money['currency'] = 'TRY',
): FlightOffer => ({ ...exampleOffer, id, totalPrice: { amountMinor, currency } });

describe('sortOffersByPrice', () => {
  it('sorts by price then ID without changing the source or offers', () => {
    const source = [offer('A', 501), offer('C', 500), offer('B', 500)];
    const before = structuredClone(source);
    source.forEach(item => { Object.freeze(item.totalPrice); Object.freeze(item); });
    Object.freeze(source);
    const result = sortOffersByPrice(source);
    expect(result.map(item => item.id)).toEqual(['B', 'C', 'A']);
    expect(source).toEqual(before);
    expect(result).not.toBe(source);
    expect(sortOffersByPrice([...source].reverse())).toEqual(result);
  });

  it('handles empty and single-offer inputs', () => {
    expect(sortOffersByPrice([])).toEqual([]);
    const single = [offer('A', 0)];
    expect(sortOffersByPrice(single)).toEqual(single);
  });

  it('rejects mixed currencies', () => {
    expect(() => sortOffersByPrice([offer('A', 100), offer('B', 100, 'EUR')]))
      .toThrow('Mixed currencies are not supported');
  });

  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid minor-unit amount %s', amount => {
      expect(() => sortOffersByPrice([offer('A', amount)]))
        .toThrow('Invalid minor-unit amount');
    },
  );
});
