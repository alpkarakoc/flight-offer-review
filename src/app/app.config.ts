import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { FLIGHT_OFFER_SOURCE } from './offers/flight-offer-source';
import { FlightOfferHttpSource } from './offers/flight-offer-http-source';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: FLIGHT_OFFER_SOURCE, useClass: FlightOfferHttpSource }
  ]
};
