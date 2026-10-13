import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
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