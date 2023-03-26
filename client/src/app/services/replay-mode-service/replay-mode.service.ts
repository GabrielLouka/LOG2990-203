import { Injectable } from '@angular/core';
import { Action } from '@common/classes/action';

@Injectable({
    providedIn: 'root',
})
export class ReplayModeService {
    elapsedTime: number = 0;
    timerId: number;
    isRecording: boolean = false;
    recordedActions: [() => void, number][];
    // constructor() {}

    get startReplayModeAction(): Action<void> {
        const output: Action<void> = new Action<void>();
        output.add(() => this.launchReplayMode());
        return output;
    }

    startRecording(): void {
        console.log('ReplayModeService.startRecording()');
        this.resetTimer();
        this.startTimer();
    }

    stopRecording(): void {
        console.log('ReplayModeService.stopRecording()');
        this.pauseTimer();
    }

    recordAction(action: () => void): void {
        if (this.isRecording) {
            this.recordedActions.push([action, this.elapsedTime]);
        }
    }

    private launchReplayMode() {
        console.log('ReplayModeService.startReplayMode() elapsedTime: ', this.elapsedTime);
        this.recordedActions.forEach((recordedAction) => {
            console.log('recordedAction: ', recordedAction);
        });
    }

    private startTimer() {
        this.isRecording = true;
        this.timerId = window.setInterval(() => {
            this.elapsedTime += 0.1;
        }, 100);
    }

    private pauseTimer() {
        this.isRecording = false;
        clearInterval(this.timerId);
    }

    private resetTimer() {
        this.elapsedTime = 0;
        clearInterval(this.timerId);
        this.recordedActions = [];
    }
}
