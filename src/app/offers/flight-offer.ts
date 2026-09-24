export interface FlightOffer {
  id: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  durationMinutes: number;
  stops: number;
  price: number;
  currency: string;
}