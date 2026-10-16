export interface Money {
  amountMinor: number;
  currency: 'TRY' | 'EUR' | 'USD';
}

export interface FlightSegment {
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  airlineCode: string;
  flightNumber: string;
}

export interface PriceBreakdown {
  baseFareMinor: number;
  taxesMinor: number;
  feesMinor: number;
}

export interface FlightOffer {
  id: string;
  version: number;
  airlineCode: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  durationMinutes: number;
  stops: number;
  totalPrice: Money;
  segments: FlightSegment[];
  priceBreakdown: PriceBreakdown;
}
