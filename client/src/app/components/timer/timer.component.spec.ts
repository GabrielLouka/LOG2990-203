import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    const timeSeconds = 0;
    const INTERVAL_VALUE = 1000;
    const MINUTE_LIMIT = 9;

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

    // it('getMinutes should return number of minutes', () => {
    //     component.timeInSeconds = 60;
    //     const expectedMinutes = 1;
    //     const getMinutes = component.getMinutes();
    //     expect(getMinutes).toEqual(expectedMinutes);
    // });

    // it('getSeconds should return number of seconds', () => {
    //     component.timeInSeconds = 120;
    //     const expectedSeconds = 0;
    //     const getMinutes = component.getSeconds();
    //     expect(getMinutes).toEqual(expectedSeconds);
    // });

    it('stopTimer should affect true to shouldStop proprety', () => {
        component.stopTimer();
        expect(component['shouldStop']).toEqual(true);
    });

    // it('ticktock should increment timeinsecods if game still running', () => {
    //     const newTime = timeSeconds + 1;
    //     component['shouldStop'] = true;
    //     component.tickTock();
    //     expect(timeSeconds + 1).toEqual(newTime);
    // });

    it('should call the tickTock method every INTERVAL_VALUE milliseconds', fakeAsync(() => {
        spyOn(component, 'tickTock');
        component.ngAfterViewInit();
        tick(INTERVAL_VALUE);
        expect(component.tickTock).toHaveBeenCalled();
        component.ngOnDestroy();
    }));

    it('should increase timeInSeconds if shouldStop is false', () => {
        component.shouldStop = false;
        component.timeInSeconds = 0;

        component.tickTock();

        expect(component.timeInSeconds).toBe(1);
    });

    // it('should add 0 to minutes if minutes is less than 10', () => {
    //     component.timeInSeconds = 0;

    //     component.tickTock();
    //     component.minutes.nativeElement.innerText = component.getMinutes() < MINUTE_LIMIT ? '0' + component.getMinutes() : component.getMinutes();

    //     expect(component.minutes.nativeElement.innerText).toBe('00');
    // });

    it('should not add 0 to minutes if minutes is more than 9', () => {
        component.timeInSeconds = 10;

        component.tickTock();
        component.seconds.nativeElement.innerText = component.getSeconds() < MINUTE_LIMIT ? '0' + component.getSeconds() : component.getSeconds();

        expect(component.seconds.nativeElement.innerText).toBe('11');
    });

    it('should not add 0 to minutes if minutes is more than 9', () => {
        component.timeInSeconds = 600;

        component.tickTock();
        component.minutes.nativeElement.innerText = component.getMinutes() < MINUTE_LIMIT ? '0' + component.getMinutes() : component.getMinutes();

        expect(component.minutes.nativeElement.innerText).toBe('10');
    });
});
