import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers],
    }).compileComponents();
  });

  it('bootstraps with production appConfig in zoneless mode and renders idle search form', () => {
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
