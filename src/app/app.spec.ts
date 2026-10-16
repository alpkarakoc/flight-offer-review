import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { FLIGHT_OFFER_SOURCE } from './offers/flight-offer-source';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: FLIGHT_OFFER_SOURCE, useValue: { search: () => Promise.resolve([]), select: () => Promise.resolve({}) } }
      ]
    }).compileComponents();
  });

  it('renders the search form in idle state without initial offer cards or empty message', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('form')).not.toBeNull();
    expect(compiled.querySelector('.offer-card')).toBeNull();
    expect(compiled.querySelector('[role="status"]')).toBeNull();
    expect(compiled.querySelector('[role="alert"]')).toBeNull();
    expect(compiled.textContent).not.toContain('No offers found.');
  });
});
