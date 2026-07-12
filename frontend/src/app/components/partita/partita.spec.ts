import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Partita } from './partita';

describe('Partita', () => {
  let component: Partita;
  let fixture: ComponentFixture<Partita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Partita],
    }).compileComponents();

    fixture = TestBed.createComponent(Partita);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
