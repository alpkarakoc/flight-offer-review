import type { FlightOffer } from './flight-offer';

export function isValidOfferDetails(offer: FlightOffer): boolean {
  const pb = offer.priceBreakdown;
  if (
    !Number.isSafeInteger(pb.baseFareMinor) || pb.baseFareMinor < 0 ||
    !Number.isSafeInteger(pb.taxesMinor) || pb.taxesMinor < 0 ||
    !Number.isSafeInteger(pb.feesMinor) || pb.feesMinor < 0
  ) {
    return false;
  }

  if (pb.baseFareMinor + pb.taxesMinor + pb.feesMinor !== offer.totalPrice.amountMinor) {
    return false;
  }

  if (!offer.segments || offer.segments.length === 0) {
    return false;
  }

  if (offer.stops !== offer.segments.length - 1) {
    return false;
  }

  if (offer.segments[0].origin !== offer.origin) {
    return false;
  }

  if (offer.segments[offer.segments.length - 1].destination !== offer.destination) {
    return false;
  }

  for (let i = 0; i < offer.segments.length; i++) {
    const seg = offer.segments[i];
    const dep = new Date(seg.departureDate).getTime();
    const arr = new Date(seg.arrivalDate).getTime();
    
    if (Number.isNaN(dep) || Number.isNaN(arr) || dep >= arr) {
      return false;
    }

    if (i > 0) {
      const prev = offer.segments[i - 1];
      if (seg.origin !== prev.destination) {
        return false;
      }
      const prevArr = new Date(prev.arrivalDate).getTime();
      if (dep < prevArr) {
        return false;
      }
    }
  }

  return true;
}
