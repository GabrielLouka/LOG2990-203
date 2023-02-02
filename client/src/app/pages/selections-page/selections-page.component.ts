import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
// eslint-disable-next-line no-restricted-imports
import { CommunicationService } from '@app/services/communication.service';
import { ImageUploadResult } from '@common/image.upload.result';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-selections-page',
    templateUrl: './selections-page.component.html',
    styleUrls: ['./selections-page.component.scss'],
})
export class SelectionsPageComponent {
    playable = true;
    currentIndex = 0;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    generatedGameId = -1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentPageNbr = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    games: any;

    btnType = 'Retour';
    title = 'Page de configuration';

    constructor(private readonly communicationService: CommunicationService) {}
    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit() {
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
    async getGames(pageId: number): Promise<void> {
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

    // games: Game[][] = [
    //     [
    //         {
    //             description: 'Glouton',
    //             image: '.\\assets\\img\\game-icon.png',
    //             difficulty: 'DIFFICILE',
    //             ranking: [
    //                 [
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                 ],
    //                 [
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                 ],
    //             ],
    //         },
    //         {
    //             description: 'Hommes de Cro-Magnon',
    //             image: '.\\assets\\img\\game-icon.png',
    //             difficulty: 'FACILE',
    //             ranking: [
    //                 [
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                 ],
    //                 [
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                 ],
    //             ],
    //         },
    //         {
    //             description: 'Bagnoles',
    //             image: '.\\assets\\img\\game-icon.png',
    //             difficulty: 'FACILE',
    //             ranking: [
    //                 [
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                 ],
    //                 [
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                 ],
    //             ],
    //         },
    //         {
    //             description: 'Playa',
    //             image: '.\\assets\\img\\game-icon.png',
    //             difficulty: 'DIFFICILE',
    //             ranking: [
    //                 [
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                 ],
    //                 [
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                     { name: 'gabriel', score: '05:30' },
    //                 ],
    //             ],
    //         },
    //     ],
    //     [
    //         {
    //             description: 'Glouton',
    //             image: '.\\assets\\img\\game-icon.png',
    //             difficulty: 'DIFFICILE',
    //             ranking: [
    //                 [
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                 ],
    //                 [
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                 ],
    //             ],
    //         },
    //         {
    //             description: 'Hommes de Cro-Magnon',
    //             image: '.\\assets\\img\\game-icon.png',
    //             difficulty: 'FACILE',
    //             ranking: [
    //                 [
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                 ],
    //                 [
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                 ],
    //             ],
    //         },
    //         {
    //             description: 'Bagnoles',
    //             image: '.\\assets\\img\\game-icon.png',
    //             difficulty: 'FACILE',
    //             ranking: [
    //                 [
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                 ],
    //                 [
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                 ],
    //             ],
    //         },
    //         {
    //             description: 'Playa',
    //             image: '.\\assets\\img\\game-icon.png',
    //             difficulty: 'DIFFICILE',
    //             ranking: [
    //                 [
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                 ],
    //                 [
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                     { name: 'ibrahim', score: '05:30' },
    //                 ],
    //             ],
    //         },
    //     ],
    // ];
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
}
