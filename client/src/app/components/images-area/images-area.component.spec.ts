import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesAreaComponent } from './images-area.component';

describe('ImagesAreaComponent', () => {
  let component: ImagesAreaComponent;
  let fixture: ComponentFixture<ImagesAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagesAreaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagesAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
