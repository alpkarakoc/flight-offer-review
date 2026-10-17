import { describe, expect, it } from 'vitest';
import { exampleOffer } from './flight-offer.fixture';
import { isValidOfferDetails } from './flight-offer-validation';
import type { FlightOffer } from './flight-offer';

describe('isValidOfferDetails', () => {
  it('accepts a valid direct offer and a valid connecting offer', () => {
    expect(isValidOfferDetails(exampleOffer)).toBe(true);

    const connectingOffer: FlightOffer = {
      ...exampleOffer,
      departureDate: '2026-10-14T08:00:00Z',
      arrivalDate: '2026-10-14T12:00:00Z',
      durationMinutes: 240,
      stops: 1,
      segments: [
        {
          origin: 'IST',
          destination: 'FRA',
          departureDate: '2026-10-14T08:00:00Z',
          arrivalDate: '2026-10-14T09:30:00Z',
          airlineCode: 'TK',
          flightNumber: '1000',
        },
        {
          origin: 'FRA',
          destination: 'LHR',
          departureDate: '2026-10-14T10:00:00Z',
          arrivalDate: '2026-10-14T12:00:00Z',
          airlineCode: 'LH',
          flightNumber: '1001',
        },
      ],
    };
    expect(isValidOfferDetails(connectingOffer)).toBe(true);
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

  it('rejects origin or destination mismatch', () => {
    const badOrigin: FlightOffer = {
      ...exampleOffer,
      segments: [{ ...exampleOffer.segments[0], origin: 'ANK' }],
    };
    const badDest: FlightOffer = {
      ...exampleOffer,
      segments: [{ ...exampleOffer.segments[0], destination: 'CDG' }],
    };
    expect(isValidOfferDetails(badOrigin)).toBe(false);
    expect(isValidOfferDetails(badDest)).toBe(false);
  });

  it('rejects summary timestamp mismatch with first or last segment', () => {
    const mismatch: FlightOffer = {
      ...exampleOffer,
      departureDate: '2026-10-14T07:30:00Z',
      durationMinutes: 210,
    };
    expect(isValidOfferDetails(mismatch)).toBe(false);
  });

  it('rejects total duration mismatch against summary timestamps', () => {
    const badDuration: FlightOffer = {
      ...exampleOffer,
      durationMinutes: 240,
    };
    expect(isValidOfferDetails(badDuration)).toBe(false);
  });

  it('rejects timestamps without explicit UTC offset or Z', () => {
    const noTz: FlightOffer = {
      ...exampleOffer,
      departureDate: '2026-10-14T08:00:00',
      segments: [{ ...exampleOffer.segments[0], departureDate: '2026-10-14T08:00:00' }],
    };
    expect(isValidOfferDetails(noTz)).toBe(false);
  });

  it('rejects zero-minute connection or negative connection between segments', () => {
    const zeroLayover: FlightOffer = {
      ...exampleOffer,
      departureDate: '2026-10-14T08:00:00Z',
      arrivalDate: '2026-10-14T11:00:00Z',
      durationMinutes: 180,
      stops: 1,
      segments: [
        {
          origin: 'IST',
          destination: 'FRA',
          departureDate: '2026-10-14T08:00:00Z',
          arrivalDate: '2026-10-14T09:30:00Z',
          airlineCode: 'TK',
          flightNumber: '1000',
        },
        {
          origin: 'FRA',
          destination: 'LHR',
          departureDate: '2026-10-14T09:30:00Z',
          arrivalDate: '2026-10-14T11:00:00Z',
          airlineCode: 'LH',
          flightNumber: '1001',
        },
      ],
    };
    expect(isValidOfferDetails(zeroLayover)).toBe(false);
  });
});
