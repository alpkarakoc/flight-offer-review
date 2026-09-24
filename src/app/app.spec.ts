import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

it('should render the example offer data correctly', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const card = compiled.querySelector('.offer-card');
    expect(card).not.toBeNull();
    expect(compiled.querySelector('[role="status"]')).toBeNull();

    // Basic checks
    expect(card?.textContent).toContain('TK');
    expect(card?.textContent).toContain('TRY');
    expect(card?.textContent).toContain('IST');
    expect(card?.textContent).toContain('LHR');
    expect(card?.textContent).toContain('195 min');
    expect(card?.textContent).toContain('Direct');

    // R1 required field checks
    expect(card?.textContent).toContain('OFFER-99X');
    expect(card?.textContent).toContain('2026-10-14T08:30:00Z');
    expect(card?.textContent).toContain('2026-10-14T11:45:00Z');
    expect(card?.textContent).toContain('8500.5');
  });
});
