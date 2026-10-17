import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, ElementRef, ViewChildren, QueryList } from '@angular/core';
import type { FlightOffer } from '../flight-offer';
import { sortOffersByDuration } from '../flight-offer-duration-sort';
import { sortOffersByPrice } from '../flight-offer-sort';
import { filterOffersByMaxStops } from '../flight-offer-filter';
import { isValidOfferDetails } from '../flight-offer-validation';
import {
  FLIGHT_OFFER_SOURCE,
  type FlightSearchCriteria,
} from '../flight-offer-source';

type OfferListStatus = 'idle' | 'loading' | 'success' | 'error';
type SelectionStatus = 'idle' | 'validating' | 'validated' | 'conflict' | 'error';
type OfferSortOrder = 'original' | 'price' | 'duration';

const DEFAULT_LOAD_ERROR = 'Unable to load offers.';
const MIXED_CURRENCY_ERROR = 'Cannot display offers: Mixed currencies are not supported.';
const INVALID_VALUES_ERROR = 'Cannot display offers: invalid price or duration.';
const INVALID_DETAILS_ERROR = 'Cannot display offers: invalid itinerary or price breakdown.';

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
  private latestSelectionId = 0;

  offers: FlightOffer[] = [];
  status: OfferListStatus = 'idle';
  errorMessage = DEFAULT_LOAD_ERROR;

  sortOrder: OfferSortOrder = 'original';
  maxStops: number | null = null;
  visibleOffers: FlightOffer[] = [];
  sortError = '';
  expandedOfferIds = new Set<string>();

  selectionStatus: SelectionStatus = 'idle';
  selectionMessage = '';
  selectedOfferId: string | null = null;

  @ViewChildren('sortSelect') sortSelectElement!: QueryList<ElementRef<HTMLSelectElement>>;

  onSortChange(value: string): void {
    if (value !== 'original' && value !== 'price' && value !== 'duration') return;
    this.sortOrder = value;
    this.applyTransformations();
    this.ensureFocusMaintained();
  }

  onFilterChange(value: string): void {
    this.maxStops = value === 'any' ? null : parseInt(value, 10);
    this.applyTransformations();
    this.ensureFocusMaintained();
  }

  private ensureFocusMaintained(): void {
    setTimeout(() => {
      if (!document.activeElement || document.activeElement.tagName === 'BODY') {
        const selectEl = this.sortSelectElement.first?.nativeElement;
        if (selectEl) selectEl.focus();
      }
    }, 0);
  }

  private applyTransformations(): void {
    let result = this.offers;

    if (this.maxStops !== null) {
      result = filterOffersByMaxStops(result, this.maxStops);
    }

    this.sortError = '';
    if (this.sortOrder === 'price') {
      try {
        result = sortOffersByPrice(result);
      } catch {
        this.sortError = 'Cannot sort offers: prices must be valid and use one currency.';
      }
    } else if (this.sortOrder === 'duration') {
      try {
        result = sortOffersByDuration(result);
      } catch {
        this.sortError = 'Cannot sort offers: durations must be valid.';
      }
    }

    this.visibleOffers = result;

    const visibleIds = new Set(result.map((offer) => offer.id));
    for (const expandedId of Array.from(this.expandedOfferIds)) {
      if (!visibleIds.has(expandedId)) {
        this.expandedOfferIds.delete(expandedId);
      }
    }
  }

  toggleDetails(offerId: string): void {
    if (this.expandedOfferIds.has(offerId)) {
      this.expandedOfferIds.delete(offerId);
    } else {
      this.expandedOfferIds.add(offerId);
    }
  }

  async selectOffer(offerId: string, version: number): Promise<void> {
    if (this.selectionStatus === 'validating') return;

    const searchIdAtStart = this.latestSearchId;
    const selectionId = ++this.latestSelectionId;

    this.selectionStatus = 'validating';
    this.selectedOfferId = offerId;
    this.selectionMessage = 'Validating selection…';
    this.changeDetector.markForCheck();

    try {
      const response = await this.offerSource.select({ offerId, version });

      if (searchIdAtStart !== this.latestSearchId || selectionId !== this.latestSelectionId) {
        return;
      }

      if (
        response &&
        response.status === 'VALIDATED' &&
        response.offerId === offerId &&
        response.version === version
      ) {
        this.selectionStatus = 'validated';
        this.selectionMessage = 'Selection validated. No reservation has been made.';
      } else {
        this.selectionStatus = 'error';
        this.selectionMessage = 'Unable to validate the selection. Try again.';
      }
    } catch (error: unknown) {
      if (searchIdAtStart !== this.latestSearchId || selectionId !== this.latestSelectionId) {
        return;
      }

      if (error instanceof Error) {
        if (error.message.includes('OFFER_STALE') || error.message.includes('has changed')) {
          this.selectionStatus = 'conflict';
          this.selectionMessage = 'This offer has changed. Search again.';
        } else if (
          error.message.includes('OFFER_UNAVAILABLE') ||
          error.message.includes('no longer available')
        ) {
          this.selectionStatus = 'conflict';
          this.selectionMessage = 'This offer is no longer available. Search again.';
        } else {
          this.selectionStatus = 'error';
          this.selectionMessage = 'Unable to validate the selection. Try again.';
        }
      } else {
        this.selectionStatus = 'error';
        this.selectionMessage = 'Unable to validate the selection. Try again.';
      }
    }
    this.changeDetector.markForCheck();
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
    this.latestSelectionId++;
    this.sortOrder = 'original';
    this.maxStops = null;
    this.visibleOffers = [];
    this.sortError = '';
    this.errorMessage = DEFAULT_LOAD_ERROR;
    this.expandedOfferIds.clear();

    this.selectionStatus = 'idle';
    this.selectionMessage = '';
    this.selectedOfferId = null;

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

      const hasInvalidValues = offers.some(
        (offer) =>
          !Number.isSafeInteger(offer.totalPrice.amountMinor) ||
          offer.totalPrice.amountMinor < 0 ||
          !Number.isSafeInteger(offer.durationMinutes) ||
          offer.durationMinutes < 0,
      );

      if (hasInvalidValues) {
        this.offers = [];
        this.errorMessage = INVALID_VALUES_ERROR;
        this.status = 'error';
        this.changeDetector.markForCheck();
        return;
      }

      const hasInvalidDetails = offers.some((offer) => !isValidOfferDetails(offer));
      if (hasInvalidDetails) {
        this.offers = [];
        this.errorMessage = INVALID_DETAILS_ERROR;
        this.status = 'error';
        this.changeDetector.markForCheck();
        return;
      }

      this.offers = offers;
      this.status = 'success';
      this.applyTransformations();
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
