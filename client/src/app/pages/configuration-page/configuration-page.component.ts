/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-useless-escape */
/* eslint-disable prettier/prettier */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
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
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    generatedGameId = -1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentPageNbr = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    games: any;
    
    btnType = 'Retour';
    title = 'Page de configuration';
    playable = false;
    gameNbr=0;
    constructor(private readonly communicationService: CommunicationService) {
       
    }
    ngOnInit(): void {
        this.getGames(this.currentPageNbr);
    }
    
    async getGames(pageId:number): Promise<void> {
        const routeToSend = '/games/' + pageId.toString();
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} - 
                ${response.statusText} \n`;

                if (response.body !== null) {
                    const serverResult = JSON.parse(response.body);
                    this.debugDisplayMessage.next(responseString);
                    this.games = serverResult.gameContent;
                    this.gameNbr=serverResult.nbrOfGame;
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
        const isLastPage = this.currentPageNbr === Math.ceil(this.gameNbr / 4);
        const newIndex = isLastPage ? this.currentPageNbr : this.currentPageNbr + 1;
        this.currentPageNbr=newIndex;
        await this.getGames(this.currentPageNbr);
    }
    async goToPreviousSlide() {
        const isFirstPage = this.currentPageNbr === 0;
        const newIndex = isFirstPage ? this.currentPageNbr : this.currentPageNbr - 1;
        this.currentPageNbr=newIndex;
        await this.getGames(this.currentPageNbr);

    }
}
