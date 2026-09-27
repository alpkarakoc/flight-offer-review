import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import type { FlightOffer } from '../flight-offer';
import { exampleOffer } from '../flight-offer.fixture';
import {
  FLIGHT_OFFER_SOURCE,
  type FlightSearchCriteria,
} from '../flight-offer-source';

@Component({
  selector: 'app-flight-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-list.component.html',
})
export class FlightListComponent {
  private readonly offerSource = inject(FLIGHT_OFFER_SOURCE);
  private readonly changeDetector = inject(ChangeDetectorRef);

  offers: FlightOffer[] = [exampleOffer];
  status: 'loading' | 'success' | 'error' = 'success';

  async search(criteria: FlightSearchCriteria): Promise<void> {
    this.offers = [];
    this.status = 'loading';
    this.changeDetector.markForCheck();

    try {
      this.offers = await this.offerSource.search(criteria);
      this.status = 'success';
    } catch {
      this.offers = [];
      this.status = 'error';
    }

    this.changeDetector.markForCheck();
  }
}
