import { Component } from '@angular/core';
// import { GameCardComponent } from '@app/components/game-card/game-card.component';

@Component({
    selector: 'app-selections-page',
    templateUrl: './selections-page.component.html',
    styleUrls: ['./selections-page.component.scss'],
})
export class SelectionsPageComponent {
    // @ViewChild(GameCardComponent) view!: GameCardComponent;

    originTitle = 'Bonjour';

    games = [
        { title: 'Glouton', difficulty: 'FACILE' },
        { title: 'Hommes de Cro-Magnon', difficulty: 'MOYEN' },
        { title: 'Bagnoles #Cars', difficulty: 'DIFFICILE' },
        { title: 'Playa', difficulty: 'FACILE' },
    ];
}
