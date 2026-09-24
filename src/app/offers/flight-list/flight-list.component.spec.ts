import { TestBed } from '@angular/core/testing';
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
    const status = element.querySelector('[role="status"]');

    expect(status?.textContent).toContain('Loading offers...');
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
    const alert = element.querySelector('[role="alert"]');

    expect(alert?.textContent).toContain('Unable to load offers.');
    expect(element.querySelector('.offer-card')).toBeNull();
    expect(element.textContent).not.toContain('No offers found.');
    expect(element.textContent).not.toContain('Loading offers...');
  });
});
