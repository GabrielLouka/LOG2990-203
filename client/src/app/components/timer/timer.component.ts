import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { GameConstantsService } from '@app/services/game-constants-service/game-constants.service';
import { MINUTE_LIMIT, MINUTE_TO_SECONDS, NOT_FOUND } from '@common/utils/env';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent {
    @Input() isNotCountdown: boolean = true;
    @Output() timeReachedZero: EventEmitter<void> = new EventEmitter();
    @ViewChild('minute', { static: true }) minute: ElementRef;
    @ViewChild('second', { static: true }) second: ElementRef;
    timeInSeconds: number;
    initialTime: number = NOT_FOUND;

    constructor(public gameConstantsService: GameConstantsService) {
        this.gameConstantsService.initGameConstants();
    }

    get minutes(): number {
        return Math.floor(this.timeInSeconds / MINUTE_TO_SECONDS);
    }

    get seconds(): number {
        return Math.floor(this.timeInSeconds % MINUTE_TO_SECONDS);
    }

    getTimeDisplayValue(value: number): string {
        return value < MINUTE_LIMIT ? '0' + value : value.toString();
    }

    refreshTimerDisplay() {
        this.minute.nativeElement.innerText = this.getTimeDisplayValue(this.minutes);
        this.second.nativeElement.innerText = this.getTimeDisplayValue(this.seconds);
    }

    forceSetTime(elapsedTime: number) {
        if (this.isNotCountdown) this.timeInSeconds = elapsedTime;
        else {
            if (this.initialTime === NOT_FOUND) this.initialTime = this.gameConstantsService.countdownValue;
            this.timeInSeconds = this.initialTime - elapsedTime;
        }

        this.timeInSeconds = this.timeInSeconds < 0 ? 0 : this.timeInSeconds;
        this.refreshTimerDisplay();

        if (this.timeInSeconds <= 0) {
            this.timeReachedZero.emit();
        }
    }

    decreaseTime(decreaseValue: number) {
        this.timeInSeconds -= decreaseValue;
        this.timeInSeconds = this.timeInSeconds < 0 ? 0 : this.timeInSeconds;
        this.refreshTimerDisplay();
    }

    resetTimer() {
        this.timeInSeconds = this.isNotCountdown ? 0 : this.gameConstantsService.countdownValue;
        this.initialTime = this.timeInSeconds;
        this.minute.nativeElement.innerText = '00';
        this.second.nativeElement.innerText = '00';
        this.refreshTimerDisplay();
    }
}
