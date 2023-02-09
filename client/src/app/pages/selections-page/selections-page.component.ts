import { Component } from '@angular/core';
// eslint-disable-next-line no-restricted-imports
@Component({
    selector: 'app-selections-page',
    templateUrl: './selections-page.component.html',
    styleUrls: ['./selections-page.component.scss'],
})
export class SelectionsPageComponent {}
//     title = 'Page de selection';
//     playable = true;
//     debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
//     currentPageNbr: number = 0;
//     games: {
//         gameData: GameData;
//         originalImage: Buffer;
//     }[];
//     gamesNbr: number = 0;

//     showNextButton = true;
//     showPreviousButton = false;
//     constructor(private readonly communicationService: CommunicationService) {}
//     ngOnInit() {
//         this.getGames(this.currentPageNbr);
//     }

//     async getGames(pageId: number): Promise<void> {
//         const routeToSend = '/games/' + pageId.toString();
//         this.communicationService.get(routeToSend).subscribe({
//             next: (response) => {
//                 if (response.body !== null) {
//                     const serverResult = JSON.parse(response.body);
//                     this.games = serverResult.gameContent;
//                     this.gamesNbr = serverResult.nbrOfGame;
//                     this.showNextButton = this.gamesNbr - (this.currentPageNbr + 1) * 4 > 0;
//                 }
//             },
//             error: (err: HttpErrorResponse) => {
//                 const responseString = `Server Error : ${err.message}`;
//                 const serverResult: ImageUploadResult = JSON.parse(err.error);
//                 this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
//             },
//         });
//     }

//     async goToNextSlide() {
//         this.currentPageNbr++;
//         if (this.currentPageNbr > 0) {
//             this.showPreviousButton = true;
//         }
//         await this.getGames(this.currentPageNbr);
//     }

//     async goToPreviousSlide() {
//         this.currentPageNbr--;
//         if (this.currentPageNbr <= 0) {
//             this.showPreviousButton = false;
//         }
//         await this.getGames(this.currentPageNbr);
//     }
// }
