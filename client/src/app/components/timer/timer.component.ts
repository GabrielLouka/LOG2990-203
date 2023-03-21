import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { MILLISECOND_TO_SECONDS, MINUTE_LIMIT, MINUTE_TO_SECONDS } from '@common/utils/env';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements AfterViewInit, OnDestroy {
    @Input() timeInSeconds: number;
    @ViewChild('minute', { static: true }) minute: ElementRef;
    @ViewChild('second', { static: true }) second: ElementRef;

    shouldStop = false;
    intervalId: number;

    get minutes() {
        return Math.floor(this.timeInSeconds / MINUTE_TO_SECONDS);
    }

    get seconds() {
        return Math.floor(this.timeInSeconds % MINUTE_TO_SECONDS);
    }

    ngAfterViewInit() {
        this.intervalId = window.setInterval(() => {
            if (this.timeInSeconds >= 0) {
                this.ticToc();
            }
        }, MILLISECOND_TO_SECONDS);
    }

    ngOnDestroy() {
        window.clearInterval(this.intervalId);
    }

    ticToc() {
        if (!this.shouldStop) this.timeInSeconds++;
        this.minute.nativeElement.innerText = this.minutes < MINUTE_LIMIT ? '0' + this.minutes : this.minutes;
        this.second.nativeElement.innerText = this.seconds < MINUTE_LIMIT ? '0' + this.seconds : this.seconds;
    }

    stopTimer() {
        this.shouldStop = true;
    }
}
