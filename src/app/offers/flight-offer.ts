export interface Money {
  amountMinor: number;
  currency: 'TRY' | 'EUR' | 'USD';
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
}