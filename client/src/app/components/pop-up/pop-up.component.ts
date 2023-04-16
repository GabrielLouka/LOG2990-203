/* eslint-disable max-params */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Action } from '@common/classes/action';
import { MatchType } from '@common/enums/match-type';

@Component({
    selector: 'app-pop-up',
    templateUrl: './pop-up.component.html',
    styleUrls: ['./pop-up.component.scss'],
})
export class PopUpComponent {
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

    showConfirmationPopUp() {
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: 'VOULEZ-VOUS VRAIMENT QUITTER ?',
            message: '',
            option1: 'OUI',
            option2: 'NON',
            isConfirmation: true,
            isGameOver: false,
            option2Action: null,
        });
        this.showPopUp();
    }
    showGameOverPopUp(
        isWinByDefault: boolean,
        isTimerDepleted: boolean,
        matchType: MatchType,
        startReplayAction: Action<void> | null,
        username1: string | undefined,
        username2: string | undefined = undefined,
    ) {
        let winMessage;

        let secondaryMessage = 'Excellente partie !';

        if (matchType === MatchType.LimitedCoop) {
            this.isLimitedTime = true;
            winMessage = `Félicitations ${username1} et ${username2?.toUpperCase()} vous avez remporté la partie !`;
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
            option1: 'Menu Principal',
            option2: matchType === MatchType.Solo || matchType === MatchType.OneVersusOne ? 'Reprise Vidéo' : '',
            isConfirmation: false,
            isGameOver: true,
            option2Action: matchType === MatchType.Solo || matchType === MatchType.OneVersusOne ? startReplayAction : null,
        });
        this.showPopUp();
    }

    // eslint-disable-next-line max-params
    // TODO faire une interface
    showGameOverPopUpLimited(username1: string | undefined, username2: string | undefined, isWinByDefault: boolean, isSoloMode: boolean) {
        this.isLimitedTime = true;
        const soloMessage = `Félicitations ${username1?.toUpperCase()} vous avez remporté !`;
        const multiPlayerMessage = `Félicitations ${username1?.toUpperCase() + ' ' + username2?.toUpperCase()} vous avez remporté !`;
        const titleMessage = isSoloMode ? soloMessage : multiPlayerMessage;
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: isWinByDefault ? soloMessage : titleMessage,
            message: isWinByDefault ? 'Votre partenaire a quitté la partie...' : 'Excellente partie !',
            option1: 'Menu Principal',
            option2: '',
            isConfirmation: false,
            isGameOver: true,
            option2Action: null,
        });
        this.showPopUp();
    }

    showPopUp() {
        this.modal.nativeElement.style.display = 'flex';
    }

    closePopUp() {
        this.modal.nativeElement.style.display = 'none';
        this.popUpInfo[0]?.option2Action?.invoke();
    }
}
