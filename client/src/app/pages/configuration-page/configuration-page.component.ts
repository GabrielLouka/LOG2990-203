/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-useless-escape */
/* eslint-disable prettier/prettier */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameData } from '@common/game-data';
import { ImageUploadResult } from '@common/image.upload.result';
import { BehaviorSubject } from 'rxjs';
// import { Game } from '../../interfaces/games';

@Component({
    selector: 'app-configuration-page',
    templateUrl: './configuration-page.component.html',
    styleUrls: ['./configuration-page.component.scss'],
})
export class ConfigurationPageComponent implements OnInit {
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    currentPageNbr: number = 0;
    games: {
        gameData: GameData;
        originalImage: Buffer;
    }[];

    btnType = 'Retour';
    title = 'Page de configuration';
    playable = false;
    gamesNbr: number = 0;

    showNextButton = true;
    showPreviousButton = false;
    constructor(private readonly communicationService: CommunicationService) {}
    ngOnInit() {
        this.getGames(this.currentPageNbr);
    }

    async getGames(pageId: number): Promise<void> {
        const routeToSend = '/games/' + pageId.toString();
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body !== null) {
                    const serverResult = JSON.parse(response.body);
                    this.games = serverResult.gameContent;
                    this.gamesNbr = serverResult.nbrOfGame;
                    this.showNextButton = this.gamesNbr - (this.currentPageNbr + 1) * 4 > 0;
                }
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                const serverResult: ImageUploadResult = JSON.parse(err.error);
                this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
            },
        });
    }

    async goToNextSlide() {
        this.currentPageNbr++;
        if (this.currentPageNbr > 0) {
            this.showPreviousButton = true;
        }
        await this.getGames(this.currentPageNbr);
    }

    async goToPreviousSlide() {
        this.currentPageNbr--;
        if (this.currentPageNbr <= 0) {
            this.showPreviousButton = false;
        }
        await this.getGames(this.currentPageNbr);
    }
}
