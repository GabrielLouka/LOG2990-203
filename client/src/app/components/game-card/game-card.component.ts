import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @Input() title: unknown;
    @Input() difficulty: unknown;

    getDifficultyColor(difficulty: unknown) {
        switch (difficulty) {
            case 'FACILE':
                return 'green';
            case 'DIFFICILE':
                return 'red';
            default:
                return 'black';
        }
    }
}
