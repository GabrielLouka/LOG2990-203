import { Injectable } from '@angular/core';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
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
    elapsedSeconds: number = 0;
    timerId: number;
    recordedActions: DelayedMethod[] = [];
    onStartReplayMode: Action<void> = new Action<void>();
    onFinishReplayMode: Action<void> = new Action<void>();
    visibleTimer: TimerComponent;
    currentState: ReplayModeState = ReplayModeState.Idle;

    // replayedActions: [() => void, number][] = [];

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

    get isReplayModeFinished(): boolean {
        return this.currentState === ReplayModeState.FinishedReplaying;
    }

    get currentStatus(): string {
        return ReplayModeState[this.currentState];
    }

    get replaySpeed(): number {
        return DelayedMethod.speed;
    }

    set replaySpeed(speed: number) {
        DelayedMethod.speed = speed;
        this.recordedActions.forEach((action) => {
            action.pause();
            if (this.currentState === ReplayModeState.Replaying) action.resume();
        });
    }

    startRecording(): void {
        // console.log('ReplayModeService.startRecording()');
        this.resetTimer();
        this.startRecordingTimer();
    }

    stopRecording(): void {
        // console.log('ReplayModeService.stopRecording()');
        this.addMethodToReplay(() => this.finishReplayMode());
        this.stopRecordingTimer();
    }

    addMethodToReplay(action: () => void): void {
        if (this.currentState === ReplayModeState.Recording) {
            this.recordedActions.push(new DelayedMethod(action, this.elapsedSeconds * MILLISECOND_TO_SECONDS));
            // console.log('recorded action at: ', this.elapsedSeconds, ' action: ', action);
        }
    }

    launchReplayMode() {
        // console.log('ReplayModeService.startReplayMode() elapsedTime: ', this.elapsedSeconds);
        this.currentState = ReplayModeState.Replaying;
        this.stopAllPlayingActions();
        this.onStartReplayMode.invoke();

        this.pauseReplayingTimer();
        this.elapsedSeconds = 0;
        this.visibleTimer.resetTimer();

        this.startReplayingTimer();

        this.recordedActions.forEach((action) => {
            action.start();
        });
        this.currentState = ReplayModeState.Replaying;
    }

    togglePauseReplayMode() {
        if (this.currentState === ReplayModeState.Replaying) {
            this.pauseReplayingTimer();
            this.recordedActions.forEach((action) => {
                action.pause();
            });
            DelayedMethod.pauseAll();
        } else if (this.currentState === ReplayModeState.Paused) {
            this.resumeReplayingTimer();
            this.recordedActions.forEach((action) => {
                action.resume();
            });
            DelayedMethod.resumeAll();
        }
    }

    stopAllPlayingActions() {
        this.recordedActions.forEach((action) => {
            action.stop(); // cancel it if it was already started
        });
        DelayedMethod.killAll();
    }

    private finishReplayMode() {
        this.onFinishReplayMode.invoke();
        this.pauseReplayingTimer();
        this.currentState = ReplayModeState.FinishedReplaying;
        // this.stopAllPlayingActions();
    }

    private startRecordingTimer() {
        this.currentState = ReplayModeState.Recording;
        const timerIncreaseFactor = REPLAY_TIMER_DELAY / MILLISECOND_TO_SECONDS;
        this.timerId = window.setInterval(() => {
            this.elapsedSeconds += timerIncreaseFactor;
        }, REPLAY_TIMER_DELAY);
    }

    private stopRecordingTimer() {
        this.currentState = ReplayModeState.FinishedRecording;
        clearInterval(this.timerId);
    }

    private startReplayingTimer() {
        this.currentState = ReplayModeState.Replaying;
        this.visibleTimer.resetTimer();
        this.visibleTimer.startTimer();
    }

    private pauseReplayingTimer() {
        this.currentState = ReplayModeState.Paused;
        clearInterval(this.timerId);
        this.visibleTimer.pause();
    }

    private resumeReplayingTimer() {
        this.currentState = ReplayModeState.Replaying;
        this.visibleTimer.resume();
    }

    private resetTimer() {
        this.elapsedSeconds = 0;
        clearInterval(this.timerId);
        this.recordedActions = [];
    }
}
