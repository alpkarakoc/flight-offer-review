import { TestBed } from '@angular/core/testing';
import type { FlightOffer, Money } from '../flight-offer';
import { exampleOffer } from '../flight-offer.fixture';
import {
  FLIGHT_OFFER_SOURCE,
  type FlightSearchCriteria,
} from '../flight-offer-source';
import { FlightListComponent } from './flight-list.component';

const makeOffer = (
  id: string,
  amountMinor: number,
  currency: Money['currency'] = 'TRY',
  durationMinutes = exampleOffer.durationMinutes,
): FlightOffer => ({
  ...exampleOffer,
  id,
  durationMinutes,
  totalPrice: { amountMinor, currency },
});

describe('FlightListComponent', () => {
  it('renders neither offer cards nor an empty message in initial idle state', async () => {
    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.status).toBe('idle');
    expect(element.querySelector('.offer-card')).toBeNull();
    expect(element.textContent).not.toContain('No offers found.');
  });

  it('shows an empty message without offer cards when search succeeds with no results', async () => {
    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    fixture.componentInstance.status = 'success';
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

    expect(element.querySelector('[role="status"]')?.textContent).toContain('Loading offers...');
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

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Unable to load offers.');
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
      providers: [{ provide: FLIGHT_OFFER_SOURCE, useValue: source }],
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
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Loading offers...');
    expect(element.querySelector('.offer-card')).toBeNull();
    expect(element.textContent).not.toContain('No offers found.');

    resolveOffers([exampleOffer]);
    await search;
    await fixture.whenStable();

    expect(element.querySelector('.offer-card')?.textContent).toContain(exampleOffer.id);
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
      providers: [{ provide: FLIGHT_OFFER_SOURCE, useValue: source }],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const firstCriteria: FlightSearchCriteria = { origin: 'IST', destination: 'LHR', date: '2026-10-14' };
    const secondCriteria: FlightSearchCriteria = { origin: 'IST', destination: 'LHR', date: '2026-10-15' };

    const latestOffer: FlightOffer = {
      ...exampleOffer,
      id: 'OFFER-LATEST',
      version: 2,
      totalPrice: { amountMinor: 750000, currency: 'TRY' },
    };

    const firstSearch = fixture.componentInstance.search(firstCriteria);
    const secondSearch = fixture.componentInstance.search(secondCriteria);
    await fixture.whenStable();

    expect(resolveSearches).toHaveLength(2);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Loading offers...');
    expect(element.querySelector('.offer-card')).toBeNull();

    resolveSearches[1]([latestOffer]);
    await secondSearch;
    await fixture.whenStable();

    expect(element.querySelector('.offer-card')?.textContent).toContain(latestOffer.id);

    resolveSearches[0]([exampleOffer]);
    await firstSearch;
    await fixture.whenStable();

    expect(element.querySelector('.offer-card')?.textContent).toContain(latestOffer.id);
    expect(element.textContent).not.toContain(exampleOffer.id);
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('keeps the latest result when an earlier search fails later', async () => {
    const searches: Array<{
      resolve: (offers: FlightOffer[]) => void;
      reject: (reason: Error) => void;
    }> = [];

    const source = {
      search(_criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
        return new Promise<FlightOffer[]>((resolve, reject) => {
          searches.push({ resolve, reject });
        });
      },
    };

    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
      providers: [{ provide: FLIGHT_OFFER_SOURCE, useValue: source }],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    await fixture.whenStable();

    const firstSearch = fixture.componentInstance.search({ origin: 'IST', destination: 'LHR', date: '2026-10-14' });
    const secondSearch = fixture.componentInstance.search({ origin: 'IST', destination: 'LHR', date: '2026-10-15' });

    expect(searches).toHaveLength(2);

    const latestOffer: FlightOffer = {
      ...exampleOffer,
      id: 'OFFER-LATEST',
      version: 2,
      totalPrice: { amountMinor: 750000, currency: 'TRY' },
    };

    searches[1].resolve([latestOffer]);
    await secondSearch;
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.offer-card')?.textContent).toContain(latestOffer.id);

    searches[0].reject(new Error('Earlier search failed'));
    await firstSearch;
    await fixture.whenStable();

    expect(element.querySelector('.offer-card')?.textContent).toContain(latestOffer.id);
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('searches with the submitted form values and displays the returned offer with all required fields', async () => {
    let receivedCriteria: FlightSearchCriteria | undefined;
    let resolveOffers!: (offers: FlightOffer[]) => void;

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
      providers: [{ provide: FLIGHT_OFFER_SOURCE, useValue: source }],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const form = element.querySelector('form');
    const origin = element.querySelector<HTMLInputElement>('input[name="origin"]');
    const destination = element.querySelector<HTMLInputElement>('input[name="destination"]');
    const date = element.querySelector<HTMLInputElement>('input[name="date"]');

    origin!.value = 'IST';
    origin!.dispatchEvent(new Event('input', { bubbles: true }));
    destination!.value = 'LHR';
    destination!.dispatchEvent(new Event('input', { bubbles: true }));
    date!.value = '2026-10-14';
    date!.dispatchEvent(new Event('input', { bubbles: true }));

    form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(receivedCriteria).toEqual({ origin: 'IST', destination: 'LHR', date: '2026-10-14' });
    expect(element.querySelector('.offer-card')).toBeNull();

    const returnedOffer: FlightOffer = {
      id: 'OFFER-FROM-SEARCH',
      version: 1,
      airlineCode: 'TK',
      origin: 'IST',
      destination: 'LHR',
      departureDate: '2026-10-14T08:00:00Z',
      arrivalDate: '2026-10-14T10:00:00Z',
      durationMinutes: 120,
      stops: 0,
      totalPrice: { amountMinor: 500050, currency: 'TRY' },
    };

    resolveOffers([returnedOffer]);
    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();

    const card = element.querySelector('.offer-card');
    expect(card).not.toBeNull();

    expect(card?.querySelector('.offer-id')?.textContent).toContain('ID: OFFER-FROM-SEARCH');
    expect(card?.querySelector('.route')?.textContent).toContain('IST');
    expect(card?.querySelector('.route')?.textContent).toContain('LHR');
    expect(card?.querySelector('.times')?.textContent).toContain('Departure: 2026-10-14T08:00:00Z');
    expect(card?.querySelector('.times')?.textContent).toContain('Arrival: 2026-10-14T10:00:00Z');
    expect(card?.querySelector('.duration')?.textContent).toContain('Duration: 120 min');
    expect(card?.querySelector('.stops')?.textContent).toContain('Stops: 0');

    const priceText = card?.querySelector('.price')?.textContent ?? '';
    expect(priceText).toContain('TRY');
    expect(priceText).toContain('5,000.50');
    expect(priceText).not.toContain('500050');

    expect(element.textContent).not.toContain(exampleOffer.id);
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('sorts visible cards by price then ID and restores original order without mutating source offers', async () => {
    const sourceOffers = [makeOffer('A', 501), makeOffer('C', 500), makeOffer('B', 500)];
    const source = {
      search(_criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
        return Promise.resolve(sourceOffers);
      },
    };

    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
      providers: [{ provide: FLIGHT_OFFER_SOURCE, useValue: source }],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    await fixture.componentInstance.search({ origin: 'IST', destination: 'LHR', date: '2026-10-14' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const renderedIds = () =>
      Array.from(element.querySelectorAll('.offer-card .offer-id')).map((el) => el.textContent?.trim());

    expect(renderedIds()).toEqual(['ID: A', 'ID: C', 'ID: B']);

    const select = element.querySelector<HTMLSelectElement>('#offer-sort');
    expect(select).not.toBeNull();

    select!.value = 'price';
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(renderedIds()).toEqual(['ID: B', 'ID: C', 'ID: A']);
    expect(fixture.componentInstance.offers.map((item) => item.id)).toEqual(['A', 'C', 'B']);

    select!.value = 'original';
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(renderedIds()).toEqual(['ID: A', 'ID: C', 'ID: B']);
  });

  it('sorts visible cards by duration then ID independently from price order and restores original order', async () => {
    const sourceOffers = [
      makeOffer('A', 400, 'TRY', 300),
      makeOffer('C', 600, 'TRY', 120),
      makeOffer('B', 500, 'TRY', 120),
    ];
    const source = {
      search(_criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
        return Promise.resolve(sourceOffers);
      },
    };

    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
      providers: [{ provide: FLIGHT_OFFER_SOURCE, useValue: source }],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    await fixture.componentInstance.search({ origin: 'IST', destination: 'LHR', date: '2026-10-14' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const renderedIds = () =>
      Array.from(element.querySelectorAll('.offer-card .offer-id')).map((el) => el.textContent?.trim());

    const select = element.querySelector<HTMLSelectElement>('#offer-sort');
    expect(select).not.toBeNull();

    select!.value = 'duration';
    expect(select!.value).toBe('duration');
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(renderedIds()).toEqual(['ID: B', 'ID: C', 'ID: A']);
    expect(fixture.componentInstance.offers.map((item) => item.id)).toEqual(['A', 'C', 'B']);

    select!.value = 'original';
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(renderedIds()).toEqual(['ID: A', 'ID: C', 'ID: B']);
  });

  it('rejects search results with invalid duration or price immediately without cards or sort control and recovers on a valid search', async () => {
    const batches: FlightOffer[][] = [
      [makeOffer('A', 500, 'TRY', -1), makeOffer('B', 600, 'TRY', 120)],
      [makeOffer('A', -100, 'TRY', 120), makeOffer('B', 600, 'TRY', 120)],
      [makeOffer('A', 500, 'TRY', 120), makeOffer('B', 600, 'TRY', 180)],
    ];
    let callCount = 0;

    const source = {
      search(_criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
        return Promise.resolve(batches[callCount++]);
      },
    };

    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
      providers: [{ provide: FLIGHT_OFFER_SOURCE, useValue: source }],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    const element = fixture.nativeElement as HTMLElement;

    await fixture.componentInstance.search({ origin: 'IST', destination: 'LHR', date: '2026-10-14' });
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Cannot display offers: invalid price or duration.',
    );
    expect(element.querySelector('.offer-card')).toBeNull();
    expect(element.querySelector('#offer-sort')).toBeNull();
    expect(element.textContent).not.toContain('No offers found.');

    await fixture.componentInstance.search({ origin: 'IST', destination: 'LHR', date: '2026-10-15' });
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Cannot display offers: invalid price or duration.',
    );
    expect(element.querySelector('.offer-card')).toBeNull();
    expect(element.querySelector('#offer-sort')).toBeNull();

    await fixture.componentInstance.search({ origin: 'IST', destination: 'LHR', date: '2026-10-16' });
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelector('#offer-sort')).not.toBeNull();
    const renderedIds = Array.from(element.querySelectorAll('.offer-card .offer-id')).map((el) =>
      el.textContent?.trim(),
    );
    expect(renderedIds).toEqual(['ID: A', 'ID: B']);
  });

  it('ignores an earlier invalid search response when it finishes after a newer valid search', async () => {
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
      providers: [{ provide: FLIGHT_OFFER_SOURCE, useValue: source }],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    const element = fixture.nativeElement as HTMLElement;

    const firstSearch = fixture.componentInstance.search({
      origin: 'IST',
      destination: 'LHR',
      date: '2026-10-14',
    });
    const secondSearch = fixture.componentInstance.search({
      origin: 'IST',
      destination: 'LHR',
      date: '2026-10-15',
    });

    expect(resolveSearches).toHaveLength(2);

    resolveSearches[1]([makeOffer('VALID-LATEST', 500, 'TRY', 120)]);
    await secondSearch;
    fixture.detectChanges();

    expect(element.querySelector('.offer-card')?.textContent).toContain('VALID-LATEST');
    expect(element.querySelector('[role="alert"]')).toBeNull();

    resolveSearches[0]([makeOffer('STALE-INVALID', -100, 'TRY', -1)]);
    await firstSearch;
    fixture.detectChanges();

    expect(element.querySelector('.offer-card')?.textContent).toContain('VALID-LATEST');
    expect(element.querySelector('[role="alert"]')).toBeNull();
  });

  it('rejects mixed-currency search results with an error alert and recovers on a subsequent valid search', async () => {
    const batches: FlightOffer[][] = [
      [makeOffer('A', 100, 'TRY'), makeOffer('B', 100, 'EUR')],
      [makeOffer('A', 200, 'TRY'), makeOffer('B', 100, 'TRY')],
    ];
    let callCount = 0;

    const source = {
      search(_criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
        return Promise.resolve(batches[callCount++]);
      },
    };

    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
      providers: [{ provide: FLIGHT_OFFER_SOURCE, useValue: source }],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    await fixture.componentInstance.search({ origin: 'IST', destination: 'LHR', date: '2026-10-14' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Mixed currencies are not supported',
    );
    expect(element.querySelector('.offer-card')).toBeNull();
    expect(element.textContent).not.toContain('No offers found.');

    await fixture.componentInstance.search({ origin: 'IST', destination: 'LHR', date: '2026-10-15' });
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')).toBeNull();
    const renderedIds = Array.from(element.querySelectorAll('.offer-card .offer-id')).map((el) =>
      el.textContent?.trim(),
    );
    expect(renderedIds).toEqual(['ID: A', 'ID: B']);
  });

  it('resets sort preference immediately when a new search starts before response resolves', async () => {
    let resolveSecondSearch!: (offers: FlightOffer[]) => void;
    let callCount = 0;

    const source = {
      search(_criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve([makeOffer('A', 501), makeOffer('C', 500), makeOffer('B', 500)]);
        }
        return new Promise<FlightOffer[]>((resolve) => {
          resolveSecondSearch = resolve;
        });
      },
    };

    await TestBed.configureTestingModule({
      imports: [FlightListComponent],
      providers: [{ provide: FLIGHT_OFFER_SOURCE, useValue: source }],
    }).compileComponents();

    const fixture = TestBed.createComponent(FlightListComponent);
    await fixture.componentInstance.search({ origin: 'IST', destination: 'LHR', date: '2026-10-14' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const renderedIds = () =>
      Array.from(element.querySelectorAll('.offer-card .offer-id')).map((el) => el.textContent?.trim());

    const select = element.querySelector<HTMLSelectElement>('#offer-sort');
    expect(select).not.toBeNull();

    select!.value = 'price';
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.sortOrder).toBe('price');
    expect(renderedIds()).toEqual(['ID: B', 'ID: C', 'ID: A']);

    const secondSearchPromise = fixture.componentInstance.search({
      origin: 'IST',
      destination: 'LHR',
      date: '2026-10-15',
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.sortOrder).toBe('original');
    expect(fixture.componentInstance.sortError).toBe('');
    expect(element.querySelector('.offer-card')).toBeNull();

    resolveSecondSearch([makeOffer('D', 900), makeOffer('C', 400)]);
    await secondSearchPromise;
    fixture.detectChanges();

    const updatedSelect = element.querySelector<HTMLSelectElement>('#offer-sort');
    expect(updatedSelect?.value).toBe('original');
    expect(renderedIds()).toEqual(['ID: D', 'ID: C']);
  });
});
