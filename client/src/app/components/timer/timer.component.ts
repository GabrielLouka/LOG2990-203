import { Component, ElementRef, ViewChild } from '@angular/core';
import { TimerService } from '@app/services/timer-service/timer.service';
import { MINUTE_LIMIT, MINUTE_TO_SECONDS } from '@common/utils/env';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent {
    @ViewChild('minute', { static: true }) minute: ElementRef;
    @ViewChild('second', { static: true }) second: ElementRef;
    timeInSeconds: number;

    constructor(private readonly timerService: TimerService) {}

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
}
