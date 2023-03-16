import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-info-card',
    templateUrl: './info-card.component.html',
    styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent {
    @Input() isEasy: boolean = true;
    @Input() is1vs1: boolean = true;
    @Input() isClassicMode: boolean = true;

    get difficulty() {
        if (this.isEasy) return 'Facile';
        return 'Difficile';
    }

    get matchType() {
        if (this.is1vs1) return '1 vs 1';
        return 'Solo';
    }

    get matchMode() {
        if (this.isClassicMode) return 'Classique';
        return 'Temps limité';
    }
}
