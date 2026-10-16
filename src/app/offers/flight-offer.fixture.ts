import type { FlightOffer } from './flight-offer';

export const exampleOffer: FlightOffer = {
  id: 'OFFER-1',
  version: 1,
  airlineCode: 'TK',
  origin: 'IST',
  destination: 'LHR',
  departureDate: '2026-10-14T08:00:00Z',
  arrivalDate: '2026-10-14T11:00:00Z',
  durationMinutes: 180,
  stops: 0,
  totalPrice: {
    amountMinor: 500000,
    currency: 'TRY',
  },
  segments: [
    {
      origin: 'IST',
      destination: 'LHR',
      departureDate: '2026-10-14T08:00:00Z',
      arrivalDate: '2026-10-14T11:00:00Z',
      airlineCode: 'TK',
      flightNumber: '1979',
    },
  ],
  priceBreakdown: {
    baseFareMinor: 400000,
    taxesMinor: 50000,
    feesMinor: 50000,
  },
};
