import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-pop-up',
    templateUrl: './pop-up.component.html',
    styleUrls: ['./pop-up.component.scss'],
})
export class PopUpComponent {
    @ViewChild('bgModal') modal!: ElementRef;
    @ViewChild('button1') option1Btn!: ElementRef;
    @ViewChild('button2') option2Btn!: ElementRef;

    popUpInfo: {
        title: string;
        message: string;
        option1: string;
        option2: string;
        isConfirmation: boolean;
        isGameOver: boolean;
    }[] = [];
    displayPopUp: boolean = true;

    showConfirmationPopUp() {
        this.popUpInfo.push({
            title: 'VOULEZ-VOUS VRAIMENT QUITTER ?',
            message: '',
            option1: 'OUI',
            option2: 'NON',
            isConfirmation: true,
            isGameOver: false,
        });
        this.showPopUp();
    }

    showGameOverPopUp(player1Wins: boolean, winningPlayerMessage: string) {
        this.popUpInfo.push({
            title: player1Wins ? 'Le joueur 1 a gagné' : 'Le joueur 2 a gagné',
            message: winningPlayerMessage,
            option1: 'Menu Principal',
            option2: 'Reprise Vidéo',
            isConfirmation: false,
            isGameOver: true,
        });
        this.showPopUp();
    }

    showPopUp() {
        this.modal.nativeElement.style.display = 'flex';
    }

    hidePopUp() {
        this.displayPopUp = false;
    }

    isQuitting() {
        return true;
    }
}
