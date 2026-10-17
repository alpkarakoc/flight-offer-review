import type { FlightOffer } from './flight-offer';

export function sortOffersByPrice(offers: readonly FlightOffer[]): FlightOffer[] {
  const currency = offers[0]?.totalPrice.currency;
  for (const offer of offers) {
    const price = offer.totalPrice;
    if (price.currency !== currency) throw new Error('Mixed currencies are not supported');
    if (!Number.isSafeInteger(price.amountMinor) || price.amountMinor < 0) {
      throw new Error('Invalid minor-unit amount');
    }
  }
  return [...offers].sort((a, b) =>
    a.totalPrice.amountMinor - b.totalPrice.amountMinor ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
