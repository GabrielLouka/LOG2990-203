import { Component, ElementRef, ViewChild } from '@angular/core';
import { Action } from '@common/classes/action';

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

    showGameOverPopUp(username: string | undefined, isWinByDefault: boolean, isSoloMode: boolean, startReplayAction: Action<void> | null) {
        const soloMessage = `Félicitations ${username?.toUpperCase()} vous avez remporté !`;
        const multiPlayerMessage = `${username?.toUpperCase()} a remporté la partie !`;
        const titleMessage = isSoloMode ? soloMessage : multiPlayerMessage;
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: isWinByDefault ? soloMessage : titleMessage,
            message: isWinByDefault ? 'Votre adversaire a quitté la partie...' : 'Excellente partie !',
            option1: 'Menu Principal',
            option2: 'Reprise Vidéo',
            isConfirmation: false,
            isGameOver: true,
            option2Action: startReplayAction,
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
