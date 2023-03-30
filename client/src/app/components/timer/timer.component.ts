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

    shouldStop = true;
    intervalId: number;
    loopingMethod: DelayedMethod;

    get minutes() {
        return Math.floor(this.timeInSeconds / MINUTE_TO_SECONDS);
    }

    get seconds() {
        return Math.floor(this.timeInSeconds % MINUTE_TO_SECONDS);
    }

    ngOnDestroy() {
        window.clearInterval(this.intervalId);
    }

    ticToc() {
        if (!this.shouldStop) this.timeInSeconds++;
        this.minute.nativeElement.innerText = this.minutes < MINUTE_LIMIT ? '0' + this.minutes : this.minutes;
        this.second.nativeElement.innerText = this.seconds < MINUTE_LIMIT ? '0' + this.seconds : this.seconds;
    }

    resetTimer() {
        this.timeInSeconds = 0;
        this.minute.nativeElement.innerText = '00';
        this.second.nativeElement.innerText = '00';
        clearInterval(this.intervalId);
        this.loopingMethod?.pause();
    }

    startTimer() {
        this.shouldStop = false;
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
        this.shouldStop = true;
        this.loopingMethod.pause();
    }

    resumeTimer() {
        this.shouldStop = false;
        this.loopingMethod.resume();
    }
}
