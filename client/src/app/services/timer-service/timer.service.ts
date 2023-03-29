import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { MILLISECOND_TO_SECONDS, MINUTE_LIMIT, MINUTE_TO_SECONDS } from '@common/utils/env';

@Injectable({
    providedIn: 'root',
})
export class TimerService implements OnDestroy {
    private timeInSeconds: number;
    private shouldStop = false;
    private interval: number;

    get intervalTime() {
        return this.interval;
    }

    get currentMinutes() {
        return Math.floor(this.timeInSeconds / MINUTE_TO_SECONDS);
    }

    get currentSeconds() {
        return Math.floor(this.timeInSeconds % MINUTE_TO_SECONDS);
    }

    get winningTimeInSeconds(): number {
        return this.currentMinutes * MINUTE_TO_SECONDS + this.currentSeconds;
    }

    get winningTimeToString(): string {
        return this.currentMinutes.toString() + ':' + this.currentSeconds.toString();
    }

    handleTickingTime(minute: ElementRef, second: ElementRef) {
        this.interval = window.setInterval(() => {
            if (this.timeInSeconds >= 0) {
                this.ticToc(minute, second);
            }
        }, MILLISECOND_TO_SECONDS);
    }

    start() {
        this.timeInSeconds = 0;
    }

    ngOnDestroy(): void {
        window.clearInterval(this.interval);
    }

    ticToc(minute: ElementRef, second: ElementRef) {
        if (!this.shouldStop) this.timeInSeconds++;
        minute.nativeElement.innerText = this.currentMinutes < MINUTE_LIMIT ? '0' + this.currentMinutes : this.currentMinutes;
        second.nativeElement.innerText = this.currentSeconds < MINUTE_LIMIT ? '0' + this.currentSeconds : this.currentSeconds;
    }

    convertScoreToString(scoreTime: number): string {
        const formattedMinutes = Math.floor(scoreTime / MINUTE_TO_SECONDS).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
        });
        const formattedSeconds = Math.floor(scoreTime % MINUTE_TO_SECONDS).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
        });
        return formattedMinutes + ':' + formattedSeconds;
    }

    stop() {
        this.shouldStop = true;
    }
}
