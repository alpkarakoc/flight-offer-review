import type { FlightOffer } from './flight-offer';

const ISO_TIMESTAMP_WITH_TZ =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

function parseValidTimestamp(value: string): number {
  if (typeof value !== 'string' || !ISO_TIMESTAMP_WITH_TZ.test(value)) {
    return Number.NaN;
  }
  return Date.parse(value);
}

export function isValidOfferDetails(offer: FlightOffer): boolean {
  if (!offer || !offer.priceBreakdown || !offer.totalPrice) {
    return false;
  }

  const pb = offer.priceBreakdown;
  if (
    !Number.isSafeInteger(pb.baseFareMinor) || pb.baseFareMinor < 0 ||
    !Number.isSafeInteger(pb.taxesMinor) || pb.taxesMinor < 0 ||
    !Number.isSafeInteger(pb.feesMinor) || pb.feesMinor < 0
  ) {
    return false;
  }

  const breakdownSum = pb.baseFareMinor + pb.taxesMinor + pb.feesMinor;
  if (!Number.isSafeInteger(breakdownSum) || breakdownSum !== offer.totalPrice.amountMinor) {
    return false;
  }

  if (!Array.isArray(offer.segments) || offer.segments.length === 0) {
    return false;
  }

  if (!Number.isSafeInteger(offer.stops) || offer.stops < 0 || offer.stops !== offer.segments.length - 1) {
    return false;
  }

  const firstSegment = offer.segments[0];
  const lastSegment = offer.segments[offer.segments.length - 1];

  if (firstSegment.origin !== offer.origin || lastSegment.destination !== offer.destination) {
    return false;
  }

  if (
    firstSegment.departureDate !== offer.departureDate ||
    lastSegment.arrivalDate !== offer.arrivalDate
  ) {
    return false;
  }

  const summaryDep = parseValidTimestamp(offer.departureDate);
  const summaryArr = parseValidTimestamp(offer.arrivalDate);
  if (Number.isNaN(summaryDep) || Number.isNaN(summaryArr) || summaryDep >= summaryArr) {
    return false;
  }

  if (summaryArr - summaryDep !== offer.durationMinutes * 60_000) {
    return false;
  }

  for (let i = 0; i < offer.segments.length; i++) {
    const seg = offer.segments[i];
    if (
      !seg.origin ||
      !seg.destination ||
      seg.origin === seg.destination ||
      !seg.airlineCode ||
      !seg.flightNumber
    ) {
      return false;
    }

    const dep = parseValidTimestamp(seg.departureDate);
    const arr = parseValidTimestamp(seg.arrivalDate);

    if (Number.isNaN(dep) || Number.isNaN(arr) || dep >= arr) {
      return false;
    }

    if (i > 0) {
      const prev = offer.segments[i - 1];
      if (seg.origin !== prev.destination) {
        return false;
      }
      const prevArr = parseValidTimestamp(prev.arrivalDate);
      if (dep <= prevArr) {
        return false;
      }
    }
  }

  return true;
}
