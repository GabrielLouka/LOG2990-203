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
        matchType: MatchType,
        startReplayAction: Action<void> | null,
        username1: string | undefined,
        username2: string | undefined = undefined,
    ) {
        let winMessage;
        if (matchType === MatchType.LimitedCoop) {
            this.isLimitedTime = true;
            winMessage = `Félicitations ${username1?.toUpperCase()} et ${username2?.toUpperCase()} vous avez remporté !`;
        } else {
            winMessage = `Félicitations ${username1?.toUpperCase()} vous avez remporté !`;
        }
        //     const soloMessage = `Félicitations ${username?.toUpperCase()} vous avez remporté !`;
        // const multiPlayerMessage = `${username?.toUpperCase()} a remporté la partie !`;
        // const titleMessage = isSoloMode ? soloMessage : multiPlayerMessage;
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: winMessage,
            message: isWinByDefault
                ? matchType === MatchType.Solo || matchType === MatchType.OneVersusOne
                    ? 'Votre adversaire a quitté la partie...'
                    : 'Votre partenaire a quitté la partie...'
                : 'Excellente partie !',
            option1: 'Menu Principal',
            option2: matchType === MatchType.Solo || matchType === MatchType.OneVersusOne ? 'Reprise Vidéo' : '',
            isConfirmation: false,
            isGameOver: true,
            option2Action: matchType === MatchType.Solo || matchType === MatchType.OneVersusOne ? startReplayAction : null,
        });
        this.showPopUp();
    }
    // showGameOverPopUp(username: string | undefined, isWinByDefault: boolean, isSoloMode: boolean, startReplayAction: Action<void> | null) {
    //     const soloMessage = `Félicitations ${username?.toUpperCase()} vous avez remporté !`;
    //     const multiPlayerMessage = `${username?.toUpperCase()} a remporté la partie !`;
    //     const titleMessage = isSoloMode ? soloMessage : multiPlayerMessage;
    //     this.popUpInfo.splice(0, this.popUpInfo.length);
    //     this.popUpInfo.push({
    //         title: isWinByDefault ? soloMessage : titleMessage,
    //         message: isWinByDefault ? 'Votre adversaire a quitté la partie...' : 'Excellente partie !',
    //         option1: 'Menu Principal',
    //         option2: 'Reprise Vidéo',
    //         isConfirmation: false,
    //         isGameOver: true,
    //         option2Action: startReplayAction,
    //     });
    //     this.showPopUp();
    // }
    // eslint-disable-next-line max-params
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
