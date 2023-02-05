/* eslint-disable @typescript-eslint/no-magic-numbers */
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements AfterViewInit {
    @Input() timeInSeconds: number;
    @ViewChild('minutes', { static: true }) minutes: ElementRef;
    @ViewChild('seconds', { static: true }) seconds: ElementRef;

    ngAfterViewInit() {
        setInterval(() => {
            if (this.timeInSeconds >= 0) {
                this.tickTock();
            }
        }, 1000);
    }

    tickTock() {
        this.timeInSeconds++;
        this.minutes.nativeElement.innerText = this.getMinutes() < 10 ? '0' + this.getMinutes() : this.getMinutes();
        this.seconds.nativeElement.innerText = this.getSeconds() < 10 ? '0' + this.getSeconds() : this.getSeconds();
    }

    getMinutes() {
        return Math.floor(this.timeInSeconds / 60);
    }

    getSeconds() {
        return Math.floor(this.timeInSeconds % 60);
    }
}
