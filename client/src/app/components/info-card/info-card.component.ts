import { Component } from '@angular/core';
import { Info } from '@app/interfaces/info';

@Component({
    selector: 'app-info-card',
    templateUrl: './info-card.component.html',
    styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent {
    info: Info = {
        description: 'Glouton ',
        difficulty: 'Facile',
        mode: 'Solo classic',
        nbHints: 3,
        hintsPenalty: 10,
    };
}
