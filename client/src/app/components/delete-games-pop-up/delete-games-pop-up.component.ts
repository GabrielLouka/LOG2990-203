import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-delete-games-pop-up',
    templateUrl: './delete-games-pop-up.component.html',
    styleUrls: ['./delete-games-pop-up.component.scss'],
})
export class DeleteGamesPopUpComponent {
    @ViewChild('bgModal') modal!: ElementRef;
    @Output() isDeleteRequest = new EventEmitter<boolean>();
    popUpInfo: {
        title: string;
        message: string;
        option1: string;
        option2: string;
    }[] = [];

    showDeleteGamesPopUp(isDeleteAllGames: boolean) {
        const deleteAllGamesMessage = 'TOUS LES JEUX ?';
        const deleteThisGame = 'CE JEU ?';
        const deleteMessage = 'SUPPRIMER ';
        const message = isDeleteAllGames ? deleteAllGamesMessage : deleteThisGame;
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: deleteMessage + message,
            message: '',
            option1: 'OUI',
            option2: 'NON',
        });
        this.showPopUp();
    }

    deleteGames() {
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
