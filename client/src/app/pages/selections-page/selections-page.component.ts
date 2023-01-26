import { Component } from '@angular/core';

@Component({
    selector: 'app-selections-page',
    templateUrl: './selections-page.component.html',
    styleUrls: ['./selections-page.component.scss'],
})
export class SelectionsPageComponent {
    originTitle = 'Bonjour';

    games = [
        { title: 'Glouton', difficulty: 'FACILE' },
        { title: 'Hommes de Cro-Magnon', difficulty: 'MOYEN' },
        { title: 'Bagnoles #Cars', difficulty: 'DIFFICILE' },
        { title: 'Playa', difficulty: 'FACILE' },
    ];
}
