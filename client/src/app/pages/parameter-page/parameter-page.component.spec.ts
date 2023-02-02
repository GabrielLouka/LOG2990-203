import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterPageComponent } from './parameter-page.component';

describe('ParameterPageComponent', () => {
  let component: ParameterPageComponent;
  let fixture: ComponentFixture<ParameterPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParameterPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParameterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("clearing history should empty it", () => {
    component.clearHistory();
    expect(component.gamesHistory.length).toEqual(0);
  });

  it("deleting history when empty should signal that it is empty", () => {
    const alertSpy = spyOn(window, "confirm");
    component.gamesHistory = [];
    component.clearHistory();
    expect(alertSpy).toHaveBeenCalledWith("L'historique est déjà vide");
  })

  it("resetting time constants should gie them original values", () => {
    component.resetConstants();
    for (let i = 0; i < component.constants.length; i++) {
      expect(component.constants[i].time).toEqual(component.defaultConstants[i]);
    }
  })

});
