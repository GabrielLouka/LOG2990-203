import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { TimerService } from '@app/services/timer-service/timer.service';
import { MILLISECOND_TO_SECONDS, MINUTE_LIMIT, MINUTE_TO_SECONDS } from '@common/utils/env';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnDestroy {
    @Input() timeInSeconds: number = 0;
    @ViewChild('minute', { static: true }) minute: ElementRef;
    @ViewChild('second', { static: true }) second: ElementRef;
    intervalId: number;
    loopingMethod: DelayedMethod;

    constructor(private readonly timerService: TimerService) {}
    // shouldStop = true;

    get minutes(): number {
        return this.timerService.currentMinutes;
    }

    get seconds() {
        return Math.floor(this.timeInSeconds % MINUTE_TO_SECONDS);
    }

    getTime(): string {
        return this.displayTimeValue(this.minutes) + ':' + this.displayTimeValue(this.seconds);
    }

    // ngAfterViewInit() {
    //     this.intervalId = window.setInterval(() => {
    //         if (this.timeInSeconds >= 0) {
    //             this.ticToc();
    //         }
    //     }, MILLISECOND_TO_SECONDS);
    // }

    // ngOnDestroy() {
    //     window.clearInterval(this.intervalId);
    // }

    displayTimeValue(value: number): string {
        return value < MINUTE_LIMIT ? '0' + value : value.toString();
    }

    ngOnDestroy() {
        window.clearInterval(this.intervalId);
    }

    // ticToc() {
    //     if (!this.shouldStop) this.timeInSeconds++;
    //     this.minute.nativeElement.innerText = this.displayTimeValue(this.minutes);
    //     this.second.nativeElement.innerText = this.displayTimeValue(this.seconds);
    // }

    // stopTimer() {
    //     this.shouldStop = true;
    //     return this.timerService.currentSeconds;
    // }

    // ngOnDestroy() {
    //     this.timerService.ngOnDestroy();
    // }
    resetTimer() {
        this.timeInSeconds = 0;
        this.minute.nativeElement.innerText = '00';
        this.second.nativeElement.innerText = '00';
        clearInterval(this.intervalId);
        this.loopingMethod?.pause();
    }

    startTimer() {
        // this.shouldStop = false;
        // this.intervalId = window.setInterval(() => {
        //     if (this.timeInSeconds >= 0) {
        //         this.ticToc();
        //     }
        // }, MILLISECOND_TO_SECONDS);

        this.loopingMethod = new DelayedMethod(
            () => {
                if (this.timeInSeconds >= 0) {
                    this.timerService.ticToc(this.minute, this.second);
                }
            },
            MILLISECOND_TO_SECONDS,
            true,
        );
        this.loopingMethod.start();
    }

    pauseTimer() {
        // this.shouldStop = true;
        this.loopingMethod.pause();
    }

    resumeTimer() {
        // this.shouldStop = false;
        this.loopingMethod.resume();
    }
}
