import { Component, Input } from '@angular/core';
import { Game } from '@app/interfaces/games';

@Component({
    selector: 'app-info-icon',
    templateUrl: './info-icon.component.html',
    styleUrls: ['./info-icon.component.scss'],
})
export class InfoIconComponent {
    @Input() soloClassicGame: Game;
}
