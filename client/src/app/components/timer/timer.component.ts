import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { INTERVAL_VALUE, MINUTE, MINUTE_LIMIT } from '@common/pixel';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements AfterViewInit, OnDestroy {
    @Input() timeInSeconds: number;
    @ViewChild('minutes', { static: true }) minutes: ElementRef;
    @ViewChild('seconds', { static: true }) seconds: ElementRef;

    shouldStop = false;
    intervalId: number;

    ngAfterViewInit() {
        this.intervalId = window.setInterval(() => {
            if (this.timeInSeconds >= 0) {
                this.tickTock();
            }
        }, INTERVAL_VALUE);
    }

    ngOnDestroy() {
        window.clearInterval(this.intervalId);
    }

    tickTock() {
        if (!this.shouldStop) this.timeInSeconds++;
        this.minutes.nativeElement.innerText = this.getMinutes() < MINUTE_LIMIT ? '0' + this.getMinutes() : this.getMinutes();
        this.seconds.nativeElement.innerText = this.getSeconds() < MINUTE_LIMIT ? '0' + this.getSeconds() : this.getSeconds();
    }

    getMinutes() {
        return Math.floor(this.timeInSeconds / MINUTE);
    }

    getSeconds() {
        return Math.floor(this.timeInSeconds % MINUTE);
    }

    stopTimer() {
        this.shouldStop = true;
    }
}
