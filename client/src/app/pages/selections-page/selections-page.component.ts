import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
// eslint-disable-next-line no-restricted-imports
import { CommunicationService } from '@app/services/communication.service';
import { GameData } from '@common/game-data';
import { ImageUploadResult } from '@common/image.upload.result';
import { Buffer } from 'buffer';
import { BehaviorSubject } from 'rxjs';
@Component({
    selector: 'app-selections-page',
    templateUrl: './selections-page.component.html',
    styleUrls: ['./selections-page.component.scss'],
})
export class SelectionsPageComponent implements OnInit {
    title = 'Page de configuration';
    playable = true;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    currentPageNbr: number = 0;
    games: {
        gameData: GameData;
        originalImage: Buffer;
    }[];
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
                    if (this.gamesNbr - (this.currentPageNbr + 1) * 4 <= 0) {
                        this.showNextButton = false;
                    } else {
                        this.showNextButton = true;
                    }
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
        await this.getGames(this.currentPageNbr);
    }
}
