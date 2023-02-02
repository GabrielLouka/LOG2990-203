import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-overlay',
    templateUrl: './overlay.component.html',
    styleUrls: ['./overlay.component.scss'],
})
export class OverlayComponent {
    @Input() isPlayable: boolean;
    mode: string = '';

    // Si le joueur appuie sur Jouer ou Joindre
    setSoloMode() {
        this.mode = 'Solo';
    }

    set1vs1Mode() {
        this.mode = '1 vs 1';
    }

    gameMode() {
        return this.mode;
    }
}
