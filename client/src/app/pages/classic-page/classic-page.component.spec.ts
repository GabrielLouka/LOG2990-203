import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassicPageComponent } from './classic-page.component';

describe('ClassicPageComponent', () => {
  let component: ClassicPageComponent;
  let fixture: ComponentFixture<ClassicPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassicPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassicPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
