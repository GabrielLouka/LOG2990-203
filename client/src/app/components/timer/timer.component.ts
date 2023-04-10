import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { LIMITED_TIME_DURATION, MILLISECOND_TO_SECONDS, MINUTE_LIMIT, MINUTE_TO_SECONDS } from '@common/utils/env';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnDestroy {
    @Input() incrementTime: boolean = true;
    @Output() timeReachedZero: EventEmitter<void> = new EventEmitter();
    @ViewChild('minute', { static: true }) minute: ElementRef;
    @ViewChild('second', { static: true }) second: ElementRef;
    timeInSeconds: number;
    intervalId: number;
    loopingMethod: DelayedMethod;
    shouldStop = false;

    get minutes(): number {
        return Math.floor(this.timeInSeconds / MINUTE_TO_SECONDS);
    }

    get seconds(): number {
        return Math.floor(this.timeInSeconds % MINUTE_TO_SECONDS);
    }

    get currentTimeInSeconds(): number {
        return this.timeInSeconds;
    }

    getTime(): string {
        if (this.incrementTime) {
            return this.displayTimeValue(this.minutes) + ':' + this.displayTimeValue(this.seconds);
        } else {
            this.timeInSeconds = 120 - this.timeInSeconds;
            return this.displayTimeValue(this.minutes) + ':' + this.displayTimeValue(this.seconds);
        }
    }

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
        if (!this.shouldStop) {
            if (this.incrementTime) {
                this.timeInSeconds++;
            } else {
                this.timeInSeconds--;
                if (this.timeInSeconds <= 0) {
                    this.timeReachedZero.emit();
                }
            }
        }
        this.minute.nativeElement.innerText = this.minutes < MINUTE_LIMIT ? '0' + this.minutes : this.minutes;
        this.second.nativeElement.innerText = this.seconds < MINUTE_LIMIT ? '0' + this.seconds : this.seconds;
        this.refreshTimerDisplay();
    }

    resetTimer() {
        this.timeInSeconds = this.incrementTime ? 0 : LIMITED_TIME_DURATION;
        this.minute.nativeElement.innerText = '00';
        this.second.nativeElement.innerText = '00';
        clearInterval(this.intervalId);
        this.loopingMethod?.pause();
    }

    startTimer() {
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
