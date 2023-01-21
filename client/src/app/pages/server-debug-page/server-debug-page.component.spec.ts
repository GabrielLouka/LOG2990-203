import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerDebugPageComponent } from './server-debug-page.component';

describe('ServerDebugPageComponent', () => {
  let component: ServerDebugPageComponent;
  let fixture: ComponentFixture<ServerDebugPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerDebugPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerDebugPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
