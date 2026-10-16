import { describe, expect, it } from 'vitest';
import { exampleOffer } from './flight-offer.fixture';
import { isValidOfferDetails } from './flight-offer-validation';
import type { FlightOffer } from './flight-offer';

describe('isValidOfferDetails', () => {
  it('accepts a valid offer', () => {
    expect(isValidOfferDetails(exampleOffer)).toBe(true);
  });

  it('rejects price breakdown mismatch', () => {
    const offer: FlightOffer = {
      ...exampleOffer,
      priceBreakdown: { baseFareMinor: 400000, taxesMinor: 50000, feesMinor: 0 },
    };
    expect(isValidOfferDetails(offer)).toBe(false);
  });

  it('rejects negative price breakdown components', () => {
    const offer: FlightOffer = {
      ...exampleOffer,
      priceBreakdown: { baseFareMinor: 550000, taxesMinor: -50000, feesMinor: 0 },
    };
    expect(isValidOfferDetails(offer)).toBe(false);
  });

  it('rejects empty segments', () => {
    const offer: FlightOffer = { ...exampleOffer, segments: [], stops: -1 };
    expect(isValidOfferDetails(offer)).toBe(false);
  });

  it('rejects stops mismatch', () => {
    const offer: FlightOffer = { ...exampleOffer, stops: 1 };
    expect(isValidOfferDetails(offer)).toBe(false);
  });

  it('rejects origin mismatch', () => {
    const offer: FlightOffer = {
      ...exampleOffer,
      segments: [{ ...exampleOffer.segments[0], origin: 'ANK' }],
    };
    expect(isValidOfferDetails(offer)).toBe(false);
  });

  it('rejects destination mismatch', () => {
    const offer: FlightOffer = {
      ...exampleOffer,
      segments: [{ ...exampleOffer.segments[0], destination: 'CDG' }],
    };
    expect(isValidOfferDetails(offer)).toBe(false);
  });

  it('rejects time travel within segment', () => {
    const offer: FlightOffer = {
      ...exampleOffer,
      segments: [{ ...exampleOffer.segments[0], departureDate: '2026-10-14T12:00:00Z', arrivalDate: '2026-10-14T11:00:00Z' }],
    };
    expect(isValidOfferDetails(offer)).toBe(false);
  });

  it('rejects disconnected segments (airport)', () => {
    const offer: FlightOffer = {
      ...exampleOffer,
      stops: 1,
      segments: [
        { ...exampleOffer.segments[0], destination: 'CDG' },
        { ...exampleOffer.segments[0], origin: 'FRA', departureDate: '2026-10-14T12:00:00Z', arrivalDate: '2026-10-14T14:00:00Z' },
      ],
    };
    expect(isValidOfferDetails(offer)).toBe(false);
  });

  it('rejects disconnected segments (time)', () => {
    const offer: FlightOffer = {
      ...exampleOffer,
      stops: 1,
      segments: [
        { ...exampleOffer.segments[0] },
        { ...exampleOffer.segments[0], origin: 'LHR', destination: 'JFK', departureDate: '2026-10-14T10:00:00Z', arrivalDate: '2026-10-14T14:00:00Z' },
      ],
    };
    expect(isValidOfferDetails(offer)).toBe(false);
  });
});
