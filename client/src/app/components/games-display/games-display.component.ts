import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameData } from '@common/game-data';
import { ImageUploadResult } from '@common/image.upload.result';
import { Buffer } from 'buffer';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-games-display',
    templateUrl: './games-display.component.html',
    styleUrls: ['./games-display.component.scss'],
})
export class GamesDisplayComponent implements OnInit {
    @Input() isSelection: boolean;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    currentPageNbr: number = 0;
    games: {
        gameData: GameData;
        originalImage: Buffer;
    }[];
    title: string;
    btnType = 'Retour';
    playable = false;
    gamesNbr: number = 0;
    justifyContent: string;
    showNextButton = true;
    showPreviousButton = false;
    constructor(private readonly communicationService: CommunicationService) {}
    ngOnInit() {
        this.title = this.isSelection ? 'Page de configuration ' : 'Page de selection';
        this.justifyContent = this.isSelection ? 'center' : 'right';
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
