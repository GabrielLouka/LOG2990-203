import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'app-pop-up',
    templateUrl: './pop-up.component.html',
    styleUrls: ['./pop-up.component.scss'],
})
export class PopUpComponent {
    @ViewChild('bgModal') modal!: ElementRef;
    @ViewChild('button1') option1Btn!: ElementRef;
    @ViewChild('button2') option2Btn!: ElementRef;
    @Input() isDisplayed: boolean;

    popUpInfo: {
        title: string;
        message: string;
        option1: string;
        option2: string;
        isConfirmation: boolean;
        isGameOver: boolean;
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
        });
        this.showPopUp();
    }

    showGameOverPopUp(username: string | undefined, isWinByDefault: boolean) {
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: isWinByDefault
                ? `Félicitations ${username?.toUpperCase()} vous avez remporté !`
                : `${username?.toUpperCase()} a remporté la partie !`,
            message: isWinByDefault ? 'Votre adversaire a quitté la partie...' : 'Excellente partie !',
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

    closePopUp() {
        this.modal.nativeElement.style.display = 'none';
    }
}
