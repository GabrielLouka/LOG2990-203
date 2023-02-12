import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let timeSeconds:number = 0;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        fixture.componentInstance.timeInSeconds = timeSeconds;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("getMinutes should return number of minutes", () => {
        component.timeInSeconds = 60;
        const expectedMinutes = 1;
        const getMinutes = component.getMinutes()
        expect(getMinutes).toEqual(expectedMinutes);
    });    

    it("getSeconds should return number of seconds", () => {
        component.timeInSeconds = 120;
        const expectedSeconds = 0;
        const getMinutes = component.getSeconds()
        expect(getMinutes).toEqual(expectedSeconds);
    });

    it("stopTimer should affect true to shouldStop proprety", () => {
        component.stopTimer();
        expect(component['shouldStop']).toEqual(true);
    });

    it("ticktock should increment timeinsecods if game still running", () => {
        const newTime = timeSeconds + 1;
        component['shouldStop'] = true;
        component.tickTock();
        expect(timeSeconds + 1).toEqual(newTime);
    });

    
});
