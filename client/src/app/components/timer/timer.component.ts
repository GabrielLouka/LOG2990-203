/* eslint-disable @typescript-eslint/no-magic-numbers */
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements AfterViewInit {
    @ViewChild('minutes', { static: true }) minutes: ElementRef;
    @ViewChild('seconds', { static: true }) seconds: ElementRef;

    timeInSecond: number = 0;

    ngAfterViewInit() {
        setInterval(() => {
            if (this.timeInSecond >= 0) this.tickTock();
        }, 1000);
    }

    tickTock() {
        this.timeInSecond++;
        this.minutes.nativeElement.innerText = this.getMinutes() < 10 ? '0' + this.getMinutes() : this.getMinutes();
        this.seconds.nativeElement.innerText = this.getSeconds() < 10 ? '0' + this.getSeconds() : this.getSeconds();
    }

    getMinutes() {
        return Math.floor(this.timeInSecond / 60);
    }

    getSeconds() {
        return Math.floor(this.timeInSecond % 60);
    }
}
