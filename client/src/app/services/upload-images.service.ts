import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImageUploadResult } from '@common/image.upload.result';
import { Buffer } from 'buffer';
import { BehaviorSubject } from 'rxjs';
import { CommunicationService } from './communication.service';
@Injectable({
    providedIn: 'root',
})
export class UploadImagesService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    game: any;
    imageElement: HTMLImageElement;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(private readonly communicationService: CommunicationService) {}

    // TODO ajouter lorsque le socketId sera bien!
    async getGame() {
        const routeToSend = '/games/fetchGame/1';

        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} - 
                ${response.statusText} \n`;

                if (response.body !== null) {
                    const serverResult = JSON.parse(response.body);
                    this.debugDisplayMessage.next(responseString);
                    this.game = [serverResult];
                }
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                const serverResult: ImageUploadResult = JSON.parse(err.error);
                this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
            },
        });
    }

    async displayImage(isOriginal: boolean): Promise<void> {
        const imageElement: HTMLImageElement = new Image();
        let image: string;

        if (isOriginal) {
            image = this.game.originalImage;
        } else {
            image = this.game.modifiedImage;
        }

        imageElement.src = `data:image/bmp;base64,${Buffer.from(image).toString('base64')}`;
        imageElement.style.width = '420px';
        imageElement.style.height = '680px';

        this.imageElement = imageElement;
    }
}
