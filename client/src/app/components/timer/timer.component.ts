/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements AfterViewInit {
    @Input() init: number;
    @ViewChild('minutes', { static: true }) minutes: ElementRef;
    @ViewChild('seconds', { static: true }) seconds: ElementRef;

    timeInSecond: number = 120;

    ngAfterViewInit() {
        setInterval(() => {
            this.tickTock();
        }, 1000);
    }

    tickTock() {
        this.timeInSecond--;
        this.minutes.nativeElement.innerText = this.getMinutes();
        this.seconds.nativeElement.innerText = this.getSeconds();
    }

    getMinutes() {
        return Math.floor(this.timeInSecond / 60);
    }

    getSeconds() {
        return Math.floor(this.timeInSecond % 60);
    }
}
