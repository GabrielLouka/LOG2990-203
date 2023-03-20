import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-delete-games-pop-up',
    templateUrl: './delete-games-pop-up.component.html',
    styleUrls: ['./delete-games-pop-up.component.scss'],
})
export class DeleteGamesPopUpComponent {
    @ViewChild('modal') modal!: ElementRef;
    @Output() isDeleteRequest = new EventEmitter<boolean>();
    deleteAllGamesMessage = 'TOUS LES JEUX ?';
    deleteThisGame = 'CE JEU ?';
    deleteMessage = 'SUPPRIMER ';
    popUpInfo: {
        title: string;
        message: string;
        option1: string;
        option2: string;
        isDeleteAllGames: boolean;
    }[] = [];

    showDeleteGamesPopUp(isDeleteAllGames: boolean) {
        const message = isDeleteAllGames ? this.deleteAllGamesMessage : this.deleteThisGame;
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: this.deleteMessage + message,
            message: '',
            option1: 'OUI',
            option2: 'NON',
            isDeleteAllGames,
        });

        this.showPopUp();
    }

    emitDeleteRequestConfirmation() {
        this.isDeleteRequest.emit(true);
    }

    showPopUp() {
        this.modal.nativeElement.style.display = 'flex';
    }

    closePopUp() {
        this.isDeleteRequest.emit(false);
        this.modal.nativeElement.style.display = 'none';
    }
}
