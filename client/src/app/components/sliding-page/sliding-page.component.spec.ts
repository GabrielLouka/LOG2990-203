import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidingPageComponent } from './sliding-page.component';

describe('SlidingPageComponent', () => {
  let component: SlidingPageComponent;
  let fixture: ComponentFixture<SlidingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlidingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlidingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
