import { InjectionToken } from '@angular/core';
import type { FlightOffer } from './flight-offer';
import { exampleOffer } from './flight-offer.fixture';

export interface FlightSearchCriteria {
  origin: string;
  destination: string;
  date: string;
}

export interface FlightOfferSource {
  search(criteria: FlightSearchCriteria): Promise<FlightOffer[]>;
}

export const FLIGHT_OFFER_SOURCE = new InjectionToken<FlightOfferSource>(
  'FlightOfferSource',
  {
    providedIn: 'root',
    factory: () => ({
      search: async (criteria) => {
        const matches =
          criteria.origin === exampleOffer.origin &&
          criteria.destination === exampleOffer.destination &&
          criteria.date === exampleOffer.departureDate.slice(0, 10);

        return matches ? [exampleOffer] : [];
      },
    }),
  },
);
