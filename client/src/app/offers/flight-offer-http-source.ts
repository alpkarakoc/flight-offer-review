import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { FlightOfferSource, FlightSearchCriteria, SelectionRequest, SelectionResponse } from './flight-offer-source';
import type { FlightOffer } from './flight-offer';

@Injectable()
export class FlightOfferHttpSource implements FlightOfferSource {
  private readonly http = inject(HttpClient);

  async search(criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
    const params = new URLSearchParams({
      origin: criteria.origin,
      destination: criteria.destination,
      date: criteria.date,
    });
    
    return firstValueFrom(
      this.http.get<FlightOffer[]>(`/api/offers?${params.toString()}`)
    );
  }

  async select(request: SelectionRequest): Promise<SelectionResponse> {
    try {
      return await firstValueFrom(
        this.http.post<SelectionResponse>('/api/selections', request)
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error && error.error.code) {
        throw new Error(error.error.message || error.error.code);
      }
      throw error;
    }
  }
}
