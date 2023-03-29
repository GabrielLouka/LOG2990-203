import { Component, Input, OnInit } from '@angular/core';
import { GameData } from '@common/interfaces/game-data';
import { Buffer } from 'buffer';
@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() game: { gameData: GameData; originalImage: Buffer; matchToJoinIfAvailable: string | null };
    @Input() isPlayable: boolean;
    difficulty: string;
    originalImageSrc: string;

    get difficultyColor(): string {
        return this.game.gameData.isEasy ? 'green' : 'red';
    }

    ngOnInit() {
        this.difficulty = this.game.gameData.isEasy ? 'Facile' : 'Difficile';
        this.originalImageSrc = `data:image/bmp;base64,${Buffer.from(this.game.originalImage).toString('base64')}`;
    }
}
