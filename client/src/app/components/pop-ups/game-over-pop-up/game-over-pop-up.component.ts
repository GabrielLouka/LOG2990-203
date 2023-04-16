/* eslint-disable max-params */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Action } from '@common/classes/action';
import { MatchType } from '@common/enums/match-type';
import { EXCELLENT_GAME_TEXT, MAIN_MENU_TEXT, NO_TEXT, QUITTING_CONFIRMATION_TEXT, REPLAY_MODE_TEXT, YES_TEXT } from '@common/utils/env';

@Component({
    selector: 'app-game-over-pop-up',
    templateUrl: './game-over-pop-up.component.html',
    styleUrls: ['./game-over-pop-up.component.scss'],
})
export class GameOverPopUpComponent {
    @ViewChild('bgModal') modal!: ElementRef;

    popUpInfo: {
        title: string;
        message: string;
        option1: string;
        option2: string;
        isConfirmation: boolean;
        isGameOver: boolean;
        option2Action: Action<void> | null;
    }[] = [];
    isLimitedTime: boolean = false;

    displayConfirmation() {
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: QUITTING_CONFIRMATION_TEXT,
            message: '',
            option1: YES_TEXT,
            option2: NO_TEXT,
            isConfirmation: true,
            isGameOver: false,
            option2Action: null,
        });
        this.display();
    }

    displayGameOver(
        isWinByDefault: boolean,
        isTimerDepleted: boolean,
        matchType: MatchType,
        startReplayAction: Action<void> | null,
        username1: string | undefined,
        username2: string | undefined = undefined,
    ) {
        let winMessage;

        let secondaryMessage = EXCELLENT_GAME_TEXT;

        if (matchType === MatchType.LimitedCoop) {
            this.isLimitedTime = true;
            winMessage = `Félicitations ${username1} et ${username2} vous avez remporté la partie !`;
        } else {
            if (matchType === MatchType.LimitedSolo || matchType === MatchType.Solo) winMessage = 'Félicitations vous avez remporté la partie !';
            else winMessage = `${username1} a remporté la partie !`;
        }
        if (matchType === MatchType.LimitedSolo || matchType === MatchType.LimitedCoop) {
            if (isTimerDepleted) {
                winMessage = 'Le temps est écoulé!';
                secondaryMessage = 'Dommage...';
            }
        }
        if (isWinByDefault) {
            secondaryMessage = 'Votre adversaire a quitté la partie...';
        }
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: winMessage,
            message: secondaryMessage,
            option1: MAIN_MENU_TEXT,
            option2: matchType === MatchType.Solo || matchType === MatchType.OneVersusOne ? REPLAY_MODE_TEXT : '',
            isConfirmation: false,
            isGameOver: true,
            option2Action: matchType === MatchType.Solo || matchType === MatchType.OneVersusOne ? startReplayAction : null,
        });
        this.display();
    }

    // eslint-disable-next-line max-params
    // TODO faire une interface
    displayLimitedGameOver(username1: string | undefined, username2: string | undefined, isWinByDefault: boolean, isSoloMode: boolean) {
        this.isLimitedTime = true;
        const soloMessage = `Félicitations ${username1} vous avez remporté !`;
        const multiPlayerMessage = `Félicitations ${username1 + ' ' + username2} vous avez remporté !`;
        const titleMessage = isSoloMode ? soloMessage : multiPlayerMessage;
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: isWinByDefault ? soloMessage : titleMessage,
            message: isWinByDefault ? 'Votre partenaire a quitté la partie...' : EXCELLENT_GAME_TEXT,
            option1: MAIN_MENU_TEXT,
            option2: '',
            isConfirmation: false,
            isGameOver: true,
            option2Action: null,
        });
        this.display();
    }

    closePopUp() {
        this.modal.nativeElement.style.display = 'none';
        this.popUpInfo[0]?.option2Action?.invoke();
    }

    display() {
        this.modal.nativeElement.style.display = 'flex';
    }
}
