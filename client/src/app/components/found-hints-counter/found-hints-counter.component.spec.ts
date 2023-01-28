import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoundHintsCounterComponent } from './found-hints-counter.component';

describe('FoundHintsCounterComponent', () => {
  let component: FoundHintsCounterComponent;
  let fixture: ComponentFixture<FoundHintsCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoundHintsCounterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoundHintsCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
