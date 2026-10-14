import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import type { FlightOffer } from '../flight-offer';
import { sortOffersByPrice } from '../flight-offer-sort';
import {
  FLIGHT_OFFER_SOURCE,
  type FlightSearchCriteria,
} from '../flight-offer-source';

type OfferListStatus = 'idle' | 'loading' | 'success' | 'error';

const DEFAULT_LOAD_ERROR = 'Unable to load offers.';
const MIXED_CURRENCY_ERROR = 'Cannot display offers: Mixed currencies are not supported.';

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
  errorMessage = DEFAULT_LOAD_ERROR;
  sortOrder: 'original' | 'price' = 'original';
  sortedOffers: FlightOffer[] = [];
  sortError = '';

  get visibleOffers(): FlightOffer[] {
    return this.sortOrder === 'price' ? this.sortedOffers : this.offers;
  }

  onSortChange(value: string): void {
    if (value !== 'original' && value !== 'price') return;
    this.sortOrder = value;
    this.sortError = '';
    this.sortedOffers = [];
    if (value === 'price') {
      try {
        this.sortedOffers = sortOffersByPrice(this.offers);
      } catch {
        this.sortError = 'Cannot sort offers: prices must be valid and use one currency.';
      }
    }
  }

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
    this.sortOrder = 'original';
    this.sortedOffers = [];
    this.sortError = '';
    this.errorMessage = DEFAULT_LOAD_ERROR;

    this.offers = [];
    this.status = 'loading';
    this.changeDetector.markForCheck();

    try {
      const offers = await this.offerSource.search(criteria);

      if (searchId !== this.latestSearchId) {
        return;
      }

      const currency = offers[0]?.totalPrice.currency;
      if (offers.some((offer) => offer.totalPrice.currency !== currency)) {
        this.offers = [];
        this.errorMessage = MIXED_CURRENCY_ERROR;
        this.status = 'error';
        this.changeDetector.markForCheck();
        return;
      }

      this.offers = offers;
      this.status = 'success';
    } catch {
      if (searchId !== this.latestSearchId) {
        return;
      }

      this.offers = [];
      this.errorMessage = DEFAULT_LOAD_ERROR;
      this.status = 'error';
    }

    this.changeDetector.markForCheck();
  }
}
