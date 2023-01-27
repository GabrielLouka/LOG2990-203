import { Component, Input } from '@angular/core';
import { Game } from '@app/interfaces/games';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
    @Input() game: Game;
    @Input() pageTitle: string;
    @Input() playable: boolean;

    // selection: 'Bonjour';

    getDifficultyColor(game: { difficulty: unknown }) {
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
