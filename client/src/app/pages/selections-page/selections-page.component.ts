import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
// eslint-disable-next-line no-restricted-imports
import { CommunicationService } from '@app/services/communication.service';
import { ImageUploadResult } from '@common/image.upload.result';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-selections-page',
    templateUrl: './selections-page.component.html',
    styleUrls: ['./selections-page.component.scss'],
})
export class SelectionsPageComponent implements OnInit {
    playable = true;
    currentIndex = 0;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    generatedGameId = -1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentPageNbr = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    games: any;
    title = 'Page de configuration';

    constructor(private readonly communicationService: CommunicationService) {}
    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit() {
        this.getGames(this.currentPageNbr);
    }

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
