// /* eslint-disable @typescript-eslint/no-magic-numbers */
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { TimerComponent } from './timer.component';

// describe('TimerComponent', () => {
//     let component: TimerComponent;
//     let fixture: ComponentFixture<TimerComponent>;
//     const timeSeconds = 0;
//     // const INTERVAL_VALUE = 1000;
//     const MINUTE_LIMIT = 9;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule],
//             declarations: [TimerComponent],
//         }).compileComponents();

//         fixture = TestBed.createComponent(TimerComponent);
//         component = fixture.componentInstance;
//         fixture.componentInstance.timeInSeconds = timeSeconds;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should get actual minutes time', () => {
//         component.timeInSeconds = 60;
//         const expectedMinutes = 1;
//         const getMinutes = component.minutes;
//         expect(getMinutes).toEqual(expectedMinutes);
//     });

//     it('should get seconds and return number of seconds', () => {
//         component.timeInSeconds = 120;
//         const expectedSeconds = 0;
//         const getMinutes = component.seconds;
//         expect(getMinutes).toEqual(expectedSeconds);
//     });

//     // it('stopTimer should affect true to shouldStop property', () => {
//     //     component.pause();
//     //     expect(component['shouldStop']).toEqual(true);
//     // });

//     it('tictoc method should increment time in seconds if game still running', () => {
//         const newTime = timeSeconds + 1;
//         component['shouldStop'] = true;
//         component.ticToc();
//         expect(timeSeconds + 1).toEqual(newTime);
//     });

//     // it('should call the tickTock method every INTERVAL_VALUE milliseconds', fakeAsync(() => {
//     //     spyOn(component, 'ticToc');
//     //     tick(INTERVAL_VALUE);
//     //     expect(component.ticToc).toHaveBeenCalled();
//     //     component.ngOnDestroy();
//     // }));

//     it('should increase timeInSeconds if shouldStop is false', () => {
//         component.shouldStop = false;
//         component.timeInSeconds = 0;

//         component.ticToc();

//         expect(component.timeInSeconds).toBe(1);
//     });

//     it('should add 0 to minutes if minutes is less than 10', () => {
//         component.timeInSeconds = 0;

//         component.ticToc();
//         component.minute.nativeElement.innerText = component.minutes < MINUTE_LIMIT ? '0' + component.minutes : component.minutes;

//         expect(component.minute.nativeElement.innerText).toBe('00');
//     });

//     it('should not add 0 to minutes if minutes is more than 9', () => {
//         component.timeInSeconds = 10;

//         component.ticToc();
//         component.second.nativeElement.innerText = component.seconds < MINUTE_LIMIT ? '0' + component.seconds : component.seconds;

//         expect(component.second.nativeElement.innerText).toBe('11');
//     });

//     it('should not add 0 to minutes if minutes is more than 9', () => {
//         component.timeInSeconds = 600;

//         component.ticToc();
//         component.minute.nativeElement.innerText = component.minutes < MINUTE_LIMIT ? '0' + component.minutes : component.minutes;

//         expect(component.minute.nativeElement.innerText).toBe('10');
//     });

//     it('shoudl return current time in seconds', () => {
//         component.timeInSeconds = 10;
//         expect(component.currentTimeInSeconds).toBe(10);
//     });

//     it('should set elapsed time', () => {
//         component.elapsedTime = 5;
//         expect(component.timeInSeconds).toBe(5);
//     });

//     it('should reset the timer', () => {
//         component.resetTimer();
//         expect(component.timeInSeconds).toBe(0);
//     });

//     it('shoudl sync time', () => {
//         component.forceSetTime(10);
//         expect(component.timeInSeconds).toBe(10);
//     });

//     it('should decrease time', () => {
//         component.applyTimePenalty(10);
//         expect(component.timeInSeconds).toBe(0);
//     });

//     it('should start timer', () => {
//         component.startTimer();
//         expect(component.shouldStop).toBe(false);
//     });

//     it('shoudl emit time when time is up', () => {
//         component.shouldStop = false;
//         component.isNotCountdown = false;
//         spyOn(component.timeReachedZero, 'emit');
//         component.timeInSeconds = 0;
//         component.ticToc();
//         expect(component.timeReachedZero.emit).toHaveBeenCalled();
//     });

//     it('should not emit time when time is not up', () => {
//         component.shouldStop = false;
//         component.isNotCountdown = false;
//         spyOn(component.timeReachedZero, 'emit');
//         component.timeInSeconds = 10;
//         component.ticToc();
//         expect(component.timeReachedZero.emit).not.toHaveBeenCalled();
//     });

//     // it('should pause timer', () => {
//     //     component.pause();
//     //     expect(component.loopingMethod.pause()).toHaveBeenCalled();
//     // });

//     // it('should resume timer', () => {
//     //     component.resume();
//     //     expect(component.loopingMethod.resume()).toHaveBeenCalled();
//     // });
// });
