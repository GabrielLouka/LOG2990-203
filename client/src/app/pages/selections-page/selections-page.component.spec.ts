import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionsPageComponent } from './selections-page.component';

describe('SelectionsPageComponent', () => {
  let component: SelectionsPageComponent;
  let fixture: ComponentFixture<SelectionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
