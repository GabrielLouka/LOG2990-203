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
currentIndex = 0;
    btnType = 'Retour';
    title = 'Page de configuration';
    playable = false;
    constructor(private readonly communicationService: CommunicationService) {
       
    }
    ngOnInit(): void {
        this.getGames(this.currentPageNbr);
    }
   

    // async giveImages() {
    //     for (const game of this.games) {
    //         const originalImage = game.originalImage;
    //         const imageElement = new Image();

    //         imageElement.src = `data:image/bmp;base64,${Buffer.from(originalImage).toString('base64')}`;
    //         imageElement.style.width = '100px';
    //         imageElement.style.height = '100px';
    //         document.body.appendChild(imageElement);
    //     }
    // }
    async getGames(pageId:number): Promise<void> {
        const routeToSend = '/games/' + pageId.toString();
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} - 
                ${response.statusText} \n`;

                if (response.body !== null) {
                    const serverResult = JSON.parse(response.body);
                    this.debugDisplayMessage.next(responseString);
                    this.games = serverResult;
                }
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                const serverResult: ImageUploadResult = JSON.parse(err.error);
                this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
            },
        });
    }
   

    goToNextSlide() {
        const isLastPage = this.currentIndex === this.games.length - 1;
        const newIndex = isLastPage ? this.currentIndex : this.currentIndex + 1;
        this.currentIndex = newIndex;
    }
    goToPreviousSlide() {
        const isFirstPage = this.currentIndex === 0;
        const newIndex = isFirstPage ? this.currentIndex : this.currentIndex - 1;
        this.currentIndex = newIndex;
    }

    // resetButton() {
    //     if (confirm('Are you sure you want to reset all the games')) {
    //         for (let i = 0; i < this.games.length; i++) {
    //             for (let j = 0; j < this.games[i].ranking.length; j++) {
    //                 this.games[i].ranking[j] = this.resetClassement;
    //             }
    //         }
    //     }
    // }
    // deleteButton() {
    //     if (confirm('Are you sure you want to delete all the games')) {
    //         const divContainer: HTMLCollectionOf<Element> = document.getElementsByClassName('container') as HTMLCollectionOf<Element>;
    //         for (let i = 0; i < divContainer.length; i++) {
    //             divContainer[i].innerHTML = '';
    //         }
    //     }
    // }
     // games: Game[][] = [[
    //     {
    //         description: 'Glouton',
    //         image: '.\\assets\\img\\game-icon.png',
    //         difficulty: 'DIFFICILE',
    //         ranking: [
    //             [
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //             ],
    //             [
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //             ],
    //         ],
    //     },
    //     {
    //         description: 'Hommes de Cro-Magnon',
    //         image: '.\\assets\\img\\game-icon.png',
    //         difficulty: 'FACILE',
    //         ranking: [
    //             [
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //             ],
    //             [
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //             ],
    //         ],
    //     },
    //     {
    //         description: 'Bagnoles',
    //         image: '.\\assets\\img\\game-icon.png',
    //         difficulty: 'FACILE',
    //         ranking: [
    //             [
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //             ],
    //             [
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //             ],
    //         ],
    //     },
    //     {
    //         description: 'Playa',
    //         image: '.\\assets\\img\\game-icon.png',
    //         difficulty: 'DIFFICILE',
    //         ranking: [
    //             [
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //             ],
    //             [
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //                 { name: 'gabriel', score: '05:30' },
    //             ],
    //         ],
    //     },
    // ],
    // [
    //     {
    //         description: 'Glouton',
    //         image: '.\\assets\\img\\game-icon.png',
    //         difficulty: 'DIFFICILE',
    //         ranking: [
    //             [
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //             ],
    //             [
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //             ],
    //         ],
    //     },
    //     {
    //         description: 'Hommes de Cro-Magnon',
    //         image: '.\\assets\\img\\game-icon.png',
    //         difficulty: 'FACILE',
    //         ranking: [
    //             [
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //             ],
    //             [
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //             ],
    //         ],
    //     },
    //     {
    //         description: 'Bagnoles',
    //         image: '.\\assets\\img\\game-icon.png',
    //         difficulty: 'MOYEN',
    //         ranking: [
    //             [
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //             ],
    //             [
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //             ],
    //         ],
    //     },
    //     {
    //         description: 'Playa',
    //         image: '.\\assets\\img\\game-icon.png',
    //         difficulty: 'MOYEN',
    //         ranking: [
    //             [
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //             ],
    //             [
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //                 { name: 'ibrahim', score: '19996' },
    //             ],
    //         ],
    //     },
    // ]
    // ];
}
