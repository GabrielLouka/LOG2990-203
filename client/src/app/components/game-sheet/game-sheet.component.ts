/* eslint-disable no-restricted-imports */
import { Component, Input } from '@angular/core';
import { Game } from '@app/interfaces/games';
@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent {
    @Input() singleGame: Game;

    messageAlert() {
        window.alert("cette fonctionnalité n'est pas disponible pour le moment");
    }
}
