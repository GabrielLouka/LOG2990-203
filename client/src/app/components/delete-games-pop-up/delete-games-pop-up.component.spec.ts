import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteGamesPopUpComponent } from './delete-games-pop-up.component';

describe('DeleteGamesPopUpComponent', () => {
  let component: DeleteGamesPopUpComponent;
  let fixture: ComponentFixture<DeleteGamesPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteGamesPopUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteGamesPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
