import { Component, Input, OnInit } from '@angular/core';
import { GameData } from '@common/game-data';

@Component({
    selector: 'app-info-card',
    templateUrl: './info-card.component.html',
    styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent implements OnInit {
    @Input() gameData: GameData;
    title: string;
    difficulty: string;

    ngOnInit() {
        this.title = this.gameData.name;
        this.getDifficulty();
    }

    getDifficulty() {
        if (this.gameData.isEasy) {
            return (this.difficulty = 'Facile');
        } else {
            return (this.difficulty = 'Difficile');
        }
    }
}
