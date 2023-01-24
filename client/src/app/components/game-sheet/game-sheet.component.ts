/* eslint-disable no-restricted-imports */
import { Component, OnInit } from '@angular/core';
import { Games } from '../../interfaces/games';
@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent implements OnInit {
    game: Games;
    ngOnInit(): void {}
}
