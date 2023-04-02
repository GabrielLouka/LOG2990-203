import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
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

    // constructor(private readonly timerService: TimerService) {}

    get minutes() {
        return Math.floor(this.timeInSeconds / MINUTE_TO_SECONDS);
    }

    get seconds() {
        return Math.floor(this.timeInSeconds % MINUTE_TO_SECONDS);
    }

    getTime(): string {
        return this.displayTimeValue(this.minutes) + ':' + this.displayTimeValue(this.seconds);
    }

    // ngOnDestroy() {
    //     window.clearInterval(this.intervalId);
    // }

    displayTimeValue(value: number): string {
        return value < MINUTE_LIMIT ? '0' + value : value.toString();
    }

    ngOnDestroy() {
        window.clearInterval(this.intervalId);
    }

    refreshTimerDisplay() {
        this.minute.nativeElement.innerText = this.displayTimeValue(this.minutes);
        this.second.nativeElement.innerText = this.displayTimeValue(this.seconds);
    }

    ticToc() {
        this.timeInSeconds++;
        this.refreshTimerDisplay();
    }

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
                    this.ticToc();
                }
            },
            MILLISECOND_TO_SECONDS,
            true,
        );
        this.loopingMethod.start();
    }

    pauseTimer() {
        this.loopingMethod.pause();
    }

    resumeTimer() {
        this.loopingMethod.resume();
    }
}
