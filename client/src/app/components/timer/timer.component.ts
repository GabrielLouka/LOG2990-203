import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { TimerService } from '@app/services/timer-service/timer.service';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements AfterViewInit, OnDestroy {
    @Input() timeInSeconds: number;
    @ViewChild('minute', { static: true }) minute: ElementRef;
    @ViewChild('second', { static: true }) second: ElementRef;
    intervalId: number;

    constructor(private timerService: TimerService) {}


    ngAfterViewInit() {
        this.intervalId = this.timerService.endTimer(this.minute, this.second, this.timeInSeconds);
    }

    ngOnDestroy() {
        this.timerService.clearInterval(this.intervalId);
    }


    stopTimer() {
        this.timerService.stopTimer();
    }
}
