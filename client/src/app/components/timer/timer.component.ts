import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { TimerService } from '@app/services/timer-service/timer.service';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnDestroy {
    @ViewChild('minute', { static: true }) minute: ElementRef;
    @ViewChild('second', { static: true }) second: ElementRef;

    constructor(private readonly timerService: TimerService) {}

    get minutes(): number {
        return this.timerService.currentMinutes;
    }

    get seconds() {
        return this.timerService.currentSeconds;
    }

    ngOnDestroy() {
        this.timerService.ngOnDestroy();
    }
}
