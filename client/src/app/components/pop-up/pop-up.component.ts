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

    showGameOverPopUp(username: string | undefined, isMode1vs1: boolean) {
        this.popUpInfo.push({
            title: isMode1vs1 ? `${username} a remporté la partie !` : `Félicitations ${username}!`,
            message: 'Toutes les différences ont été trouvées',
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
