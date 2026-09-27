import { TestBed } from '@angular/core/testing';
import type { FlightOffer } from '../flight-offer';
import { exampleOffer } from '../flight-offer.fixture';
import {
  FLIGHT_OFFER_SOURCE,
  type FlightSearchCriteria,
} from '../flight-offer-source';
import { FlightListComponent } from './flight-list.component';

describe('FlightListComponent', () => {
  it('shows an empty message without offer cards', async () => {
    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    fixture.componentInstance.offers = [];
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('No offers found.');
    expect(element.querySelector('.offer-card')).toBeNull();
  });

  it('shows loading status without offers or an empty message', async () => {
    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    fixture.componentInstance.status = 'loading';
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="status"]')?.textContent)
      .toContain('Loading offers...');
    expect(element.querySelector('.offer-card')).toBeNull();
    expect(element.textContent).not.toContain('No offers found.');
  });

  it('shows an error alert without stale offers or other states', async () => {
    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    fixture.componentInstance.status = 'error';
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="alert"]')?.textContent)
      .toContain('Unable to load offers.');
    expect(element.querySelector('.offer-card')).toBeNull();
    expect(element.textContent).not.toContain('No offers found.');
    expect(element.textContent).not.toContain('Loading offers...');
  });

  it('shows loading until a search returns an offer', async () => {
    let resolveOffers!: (offers: FlightOffer[]) => void;
    let receivedCriteria: FlightSearchCriteria | undefined;

    const source = {
      search(criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
        receivedCriteria = criteria;

        return new Promise<FlightOffer[]>((resolve) => {
          resolveOffers = resolve;
        });
      },
    };

    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
      providers: [
        { provide: FLIGHT_OFFER_SOURCE, useValue: source },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const criteria: FlightSearchCriteria = {
      origin: 'IST',
      destination: 'LHR',
      date: '2026-10-14',
    };

    const search = fixture.componentInstance.search(criteria);
    await fixture.whenStable();

    expect(receivedCriteria).toEqual(criteria);
    expect(element.querySelector('[role="status"]')?.textContent)
      .toContain('Loading offers...');
    expect(element.querySelector('.offer-card')).toBeNull();
    expect(element.textContent).not.toContain('No offers found.');

    resolveOffers([exampleOffer]);
    await search;
    await fixture.whenStable();

    expect(element.querySelector('.offer-card')?.textContent)
      .toContain(exampleOffer.id);
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('keeps the latest search result when an earlier search finishes later', async () => {
    const resolveSearches: Array<(offers: FlightOffer[]) => void> = [];

    const source = {
      search(_criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
        return new Promise<FlightOffer[]>((resolve) => {
          resolveSearches.push(resolve);
        });
      },
    };

    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
      providers: [
        { provide: FLIGHT_OFFER_SOURCE, useValue: source },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const firstCriteria: FlightSearchCriteria = {
      origin: 'IST',
      destination: 'LHR',
      date: '2026-10-14',
    };
    const secondCriteria: FlightSearchCriteria = {
      origin: 'IST',
      destination: 'LHR',
      date: '2026-10-15',
    };
    const latestOffer: FlightOffer = {
      ...exampleOffer,
      id: 'OFFER-LATEST',
    };

    const firstSearch = fixture.componentInstance.search(firstCriteria);
    const secondSearch = fixture.componentInstance.search(secondCriteria);
    await fixture.whenStable();

    expect(resolveSearches).toHaveLength(2);
    expect(element.querySelector('[role="status"]')?.textContent)
      .toContain('Loading offers...');
    expect(element.querySelector('.offer-card')).toBeNull();

    resolveSearches[1]([latestOffer]);
    await secondSearch;
    await fixture.whenStable();

    expect(element.querySelector('.offer-card')?.textContent)
      .toContain(latestOffer.id);

    resolveSearches[0]([exampleOffer]);
    await firstSearch;
    await fixture.whenStable();

    expect(element.querySelector('.offer-card')?.textContent)
      .toContain(latestOffer.id);
    expect(element.textContent).not.toContain(exampleOffer.id);
    expect(element.querySelector('[role="status"]')).toBeNull();
  });
});
