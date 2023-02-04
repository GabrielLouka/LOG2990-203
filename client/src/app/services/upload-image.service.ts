import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImageUploadResult } from '@common/image.upload.result';
import { BehaviorSubject } from 'rxjs';
import { CommunicationService } from './communication.service';

@Injectable({
    providedIn: 'root',
})
export class UploadImageService {
    images: unknown;
    games: unknown;
    currentPageNbr = 0;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(private readonly communicationService: CommunicationService) {}

    // async getGameImages(socketId: string) : Promise<void>
    async getImageFromServer(): Promise<void> {
        // TODO changer lorsque default games are done
        // const route0ToGet = '/images/' + socketId;
        const routeToSend = '/images';

        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} - 
                ${response.statusText} \n`;

                if (response.body !== null) {
                    const serverResult = JSON.parse(response.body);
                    this.debugDisplayMessage.next(responseString);
                    this.images = serverResult;
                }
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                const serverResult: ImageUploadResult = JSON.parse(err.error);
                this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
            },
        });
    }

    async getImageResultsFromServer(socketId: string): Promise<void> {
        const routeToSend = '/games/fetchGames/' + socketId;

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
}
