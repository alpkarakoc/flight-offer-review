import { InjectionToken } from '@angular/core';
import type { FlightOffer } from './flight-offer';

export interface FlightSearchCriteria {
  origin: string;
  destination: string;
  date: string;
}

export interface SelectionRequest {
  offerId: string;
  version: number;
}

export interface SelectionResponse {
  status: string;
  offerId: string;
  version: number;
}

export interface FlightOfferSource {
  search(criteria: FlightSearchCriteria): Promise<FlightOffer[]>;
  select(request: SelectionRequest): Promise<SelectionResponse>;
}

export const FLIGHT_OFFER_SOURCE = new InjectionToken<FlightOfferSource>('FLIGHT_OFFER_SOURCE');
