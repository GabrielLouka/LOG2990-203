import { Component, Input } from '@angular/core';
import { Game } from '@app/interfaces/games';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
    @Input() game: Game;
    @Input() playable: boolean;

    getDifficultyColor(game: Game) {
        switch (game.difficulty) {
            case 'FACILE':
                return 'green';
            case 'DIFFICILE':
                return 'red';
            default:
                return 'black';
        }
    }
}
