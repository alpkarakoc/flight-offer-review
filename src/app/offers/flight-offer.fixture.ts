import { FlightOffer } from './flight-offer';

export const exampleOffer: FlightOffer = {
  id: 'OFFER-99X',
  airlineCode: 'TK',
  origin: 'IST',
  destination: 'LHR',
  departureDate: '2026-10-14T08:30:00Z',
  arrivalDate: '2026-10-14T11:45:00Z',
  durationMinutes: 195,
  stops: 0,
  price: 8500.50,
  currency: 'TRY'
};