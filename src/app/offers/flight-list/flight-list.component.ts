import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import type { FlightOffer } from '../flight-offer';
import {
  FLIGHT_OFFER_SOURCE,
  type FlightSearchCriteria,
} from '../flight-offer-source';

type OfferListStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-flight-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-list.component.html',
  styleUrl: './flight-list.component.css',
})
export class FlightListComponent {
  private readonly offerSource = inject(FLIGHT_OFFER_SOURCE);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private latestSearchId = 0;

  offers: FlightOffer[] = [];
  status: OfferListStatus = 'idle';

  onSearchSubmit(event: Event): void {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    void this.search({
      origin: String(data.get('origin') ?? '').trim(),
      destination: String(data.get('destination') ?? '').trim(),
      date: String(data.get('date') ?? ''),
    });
  }

  async search(criteria: FlightSearchCriteria): Promise<void> {
    const searchId = ++this.latestSearchId;

    this.offers = [];
    this.status = 'loading';
    this.changeDetector.markForCheck();

    try {
      const offers = await this.offerSource.search(criteria);

      if (searchId !== this.latestSearchId) {
        return;
      }

      this.offers = offers;
      this.status = 'success';
    } catch {
      if (searchId !== this.latestSearchId) {
        return;
      }

      this.offers = [];
      this.status = 'error';
    }

    this.changeDetector.markForCheck();
  }
}