import { Component } from '@angular/core';
import { Info } from '@app/interfaces/info';

@Component({
    selector: 'app-info-icon',
    templateUrl: './info-icon.component.html',
    styleUrls: ['./info-icon.component.scss'],
})
export class InfoIconComponent {
    info: Info = {
        description: 'Jeu 1',
        difficulty: 'Facile',
        mode: 'Solo Classique',
        nbHints: 3,
        hintsPenalty: 10,
    };
}
