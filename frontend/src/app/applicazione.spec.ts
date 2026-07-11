import { TestBed } from '@angular/core/testing';
import { Applicazione } from './applicazione';

describe('Applicazione', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Applicazione],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(Applicazione);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(Applicazione);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, frontend');
  });
});
