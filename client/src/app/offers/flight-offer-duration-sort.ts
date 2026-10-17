import type { FlightOffer } from './flight-offer';

export function sortOffersByDuration(offers: readonly FlightOffer[]): FlightOffer[] {
  for (const offer of offers) {
    if (!Number.isSafeInteger(offer.durationMinutes) || offer.durationMinutes < 0) {
      throw new Error('Invalid duration');
    }
  }
  return [...offers].sort((a, b) =>
    a.durationMinutes - b.durationMinutes ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
