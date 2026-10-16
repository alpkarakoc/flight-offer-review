import type { FlightOffer } from './flight-offer';

export function filterOffersByMaxStops(offers: readonly FlightOffer[], maxStops: number | null): FlightOffer[] {
  if (maxStops === null) return [...offers];
  if (!Number.isSafeInteger(maxStops) || maxStops < 0) {
    throw new Error('Invalid max stops');
  }
  return offers.filter(offer => offer.stops <= maxStops);
}
