import { Injectable } from '@angular/core';
import { TimerComponent } from '@app/components/timer/timer.component';
import { Action } from '@common/classes/action';
import { MILLISECOND_TO_SECONDS, REPLAY_TIMER_DELAY } from '@common/utils/env';

export enum ReplayModeState {
    Idle,
    Recording,
    FinishedRecording,
    Replaying,
    Paused,
    FinishedReplaying,
}
@Injectable({
    providedIn: 'root',
})
export class ReplayModeService {
    elapsedTime: number = 0;
    timerId: number;
    recordedActions: [() => void, number][] = [];
    onStartReplayMode: Action<void> = new Action<void>();
    onFinishReplayMode: Action<void> = new Action<void>();
    visibleTimer: TimerComponent;
    currentState: ReplayModeState = ReplayModeState.Idle;
    replaySpeed: number = 1;

    replayedActions: [() => void, number][] = [];

    get startReplayModeAction(): Action<void> {
        const output: Action<void> = new Action<void>();
        output.add(() => this.launchReplayMode());
        return output;
    }

    get shouldShowReplayModeGUI(): boolean {
        return (
            this.currentState === ReplayModeState.Replaying ||
            this.currentState === ReplayModeState.Paused ||
            this.currentState === ReplayModeState.FinishedReplaying
        );
    }

    get isReplayModePaused(): boolean {
        return this.currentState === ReplayModeState.Paused;
    }

    get currentStatus(): string {
        return ReplayModeState[this.currentState];
    }

    startRecording(): void {
        console.log('ReplayModeService.startRecording()');
        this.resetTimer();
        this.startRecordingTimer();
    }

    stopRecording(): void {
        console.log('ReplayModeService.stopRecording()');
        this.addMethodToReplay(() => this.finishReplayMode());
        this.stopRecordingTimer();
    }

    addMethodToReplay(action: () => void): void {
        if (this.currentState === ReplayModeState.Recording) {
            this.recordedActions.push([action, this.elapsedTime]);
            console.log('recorded action at: ', this.elapsedTime);
        }
    }

    launchReplayMode() {
        console.log('ReplayModeService.startReplayMode() elapsedTime: ', this.elapsedTime);
        this.currentState = ReplayModeState.Replaying;
        this.onStartReplayMode.invoke();

        this.pauseReplayingTimer();
        this.elapsedTime = 0;
        this.visibleTimer.resetTimer();

        this.startReplayingTimer();
        this.recordedActions = this.recordedActions.concat(this.replayedActions);
        this.replayedActions.length = 0; // clear replayedActions array
    }

    togglePauseReplayMode() {
        if (this.currentState === ReplayModeState.Replaying) {
            this.pauseReplayingTimer();
        } else if (this.currentState === ReplayModeState.Paused) {
            this.startReplayingTimer();
        }
    }

    private finishReplayMode() {
        this.onFinishReplayMode.invoke();
        this.pauseReplayingTimer();
        this.currentState = ReplayModeState.FinishedReplaying;
    }

    private startRecordingTimer() {
        this.currentState = ReplayModeState.Recording;
        const timerIncreaseFactor = REPLAY_TIMER_DELAY / MILLISECOND_TO_SECONDS;
        this.timerId = window.setInterval(() => {
            this.elapsedTime += timerIncreaseFactor;
        }, REPLAY_TIMER_DELAY);
    }

    private stopRecordingTimer() {
        this.currentState = ReplayModeState.FinishedRecording;
        clearInterval(this.timerId);
    }

    private startReplayingTimer() {
        this.currentState = ReplayModeState.Replaying;
        const timerIncreaseFactor = REPLAY_TIMER_DELAY / MILLISECOND_TO_SECONDS;
        this.timerId = window.setInterval(() => {
            this.elapsedTime += timerIncreaseFactor;
            this.visibleTimer.timeInSeconds = this.elapsedTime;
            this.invokeActionsAccordingToTime();
        }, REPLAY_TIMER_DELAY / this.replaySpeed);
    }

    private pauseReplayingTimer() {
        this.currentState = ReplayModeState.Paused;
        clearInterval(this.timerId);
    }

    private invokeActionsAccordingToTime() {
        for (let i = 0; i < this.recordedActions.length; i++) {
            const currentAction = this.recordedActions[i];
            // check your condition here
            if (this.elapsedTime >= currentAction[1]) {
                currentAction[0]();
                console.log('invoked action at: ', this.elapsedTime, ' action: ', currentAction);
                this.replayedActions.push(currentAction);
                this.recordedActions.splice(i, 1);
                i--; // decrement i to account for the removed element
            }
        }
    }

    private resetTimer() {
        this.elapsedTime = 0;
        clearInterval(this.timerId);
        this.recordedActions = [];
        this.replayedActions = [];
    }
}
