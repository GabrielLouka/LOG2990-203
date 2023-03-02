import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'app-pop-up',
    templateUrl: './pop-up.component.html',
    styleUrls: ['./pop-up.component.scss'],
})
export class PopUpComponent {
    @Input() username: string = '';
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
        player: string;
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
            player: `${this.username}`,
        });
        this.showPopUp();
    }

    showGameOverPopUp() {
        this.popUpInfo.push({
            title: 'FÉLICITATIONS !',
            message: 'Vous avez trouvé toutes les différences.',
            option1: 'Menu Principal',
            option2: 'Reprise Vidéo',
            isConfirmation: false,
            isGameOver: true,
            player: `${this.username}`,
        });
        this.showPopUp();
    }

    showPopUp() {
        this.modal.nativeElement.style.display = 'flex';
    }

    hidePopUp() {
        this.displayPopUp = false;
    }
    // TODO When a player quits it needs to make other player win
    isQuitting() {
        return true;
    }
}
