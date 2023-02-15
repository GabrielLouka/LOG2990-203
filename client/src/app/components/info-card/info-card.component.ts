import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-info-card',
    templateUrl: './info-card.component.html',
    styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent implements OnInit {
    @Input() isEasy: boolean = true;
    difficulty: string;

    ngOnInit() {
        this.getDifficulty();
    }

    getDifficulty() {
        if (this.isEasy) {
            return (this.difficulty = 'Facile');
        } else {
            return (this.difficulty = 'Difficile');
        }
    }
}
