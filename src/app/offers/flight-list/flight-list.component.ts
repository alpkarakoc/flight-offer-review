import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FlightOffer } from '../flight-offer';

import { exampleOffer } from '../flight-offer.fixture';

@Component({
  selector: 'app-flight-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-list.component.html'
})
export class FlightListComponent {
  offers: FlightOffer[] = [exampleOffer];
  status: 'loading' | 'success' | 'error' = 'success';
}
