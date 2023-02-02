import { Component } from '@angular/core';
import { Info } from '@app/interfaces/info';

@Component({
    selector: 'app-info-card',
    templateUrl: './info-card.component.html',
    styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent {
    info: Info = {
        description: 'Jeu 1 ',
        difficulty: 'Facile ',
        mode: 'Solo',
        nbHints: 3,
        hintsPenalty: 10,
    };
}
