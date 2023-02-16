import { Component, Input, OnInit } from '@angular/core';
import { GameData } from '@common/game-data';
import { Buffer } from 'buffer';
@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() game: { gameData: GameData; originalImage: Buffer; isGameInProgress: boolean };
    @Input() isPlayable: boolean;
    difficulty: string;
    originalImageSrc: string;

    ngOnInit() {
        this.difficulty = this.game.gameData.isEasy ? 'Facile' : 'Difficile';
        this.originalImageSrc = `data:image/bmp;base64,${Buffer.from(this.game.originalImage).toString('base64')}`;
    }

    getDifficultyColor() {
        if (this.game.gameData.isEasy) {
            return 'green';
        } else {
            return 'red';
        }
    }
}
