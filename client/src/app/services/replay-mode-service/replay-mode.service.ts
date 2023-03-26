import { Injectable } from '@angular/core';
import { Action } from '@common/classes/action';
import { MILLISECOND_TO_SECONDS } from '@common/utils/env';

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

    addMethodToReplay(action: () => void): void {
        if (this.isRecording) {
            this.recordedActions.push([action, this.elapsedTime]);
            console.log('recorded action at: ', this.elapsedTime);
        }
    }

    private launchReplayMode() {
        console.log('ReplayModeService.startReplayMode() elapsedTime: ', this.elapsedTime);
        this.recordedActions.forEach((recordedAction) => {
            console.log('recordedAction: ', recordedAction);
            // call the action after the delay
            setTimeout(() => {
                recordedAction[0]();
            }, recordedAction[1] * MILLISECOND_TO_SECONDS);
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
