import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { DifferenceImage } from '@common/difference.image';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { ImageUploadForm } from '@common/image.upload.form';
import { ImageUploadResult } from '@common/image.upload.result';
import { Buffer } from 'buffer';
import { BehaviorSubject } from 'rxjs';
@Component({
    selector: 'app-server-debug-page',
    templateUrl: './server-debug-page.component.html',
    styleUrls: ['./server-debug-page.component.scss'],
})
export class ServerDebugPageComponent {
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    games: any;
    formToSendAfterServerConfirmation: EntireGameUploadForm;
    constructor(private readonly communicationService: CommunicationService) {}

    async giveImages() {
        for (const game of this.games) {
            const originalImage = game.originalImage;
            const imageElement = new Image();

            imageElement.src = `data:image/bmp;base64,${Buffer.from(originalImage).toString('base64')}`;
            imageElement.style.width = '100px';
            imageElement.style.height = '100px';
            document.body.appendChild(imageElement);
        }
    }
    async getGames(): Promise<void> {
        const routeToSend = '/games/0';
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
    async sendImageToServer(): Promise<void> {
        const routeToSend = '/image_processing/send-image';
        const inputValue1 = (document.getElementById('browseButton1') as HTMLInputElement).files?.[0];
        const inputValue2 = (document.getElementById('browseButton2') as HTMLInputElement).files?.[0];
        const radiusValue = (document.getElementById('radiusInput') as HTMLInputElement).value;

        if (inputValue1 !== undefined && inputValue2 !== undefined) {
            const buffer1 = await inputValue1.arrayBuffer();
            const buffer2 = await inputValue2.arrayBuffer();

            // convert buffer to int array
            const byteArray1: number[] = Array.from(new Uint8Array(buffer1));
            const byteArray2: number[] = Array.from(new Uint8Array(buffer2));

            // clear image preview
            this.updateImageDisplay(new ArrayBuffer(0));

            this.debugDisplayMessage.next('Sending image to server...');

            const firstImage: DifferenceImage = { background: byteArray1, foreground: [] };
            const secondImage: DifferenceImage = { background: byteArray2, foreground: [] };
            const radius = radiusValue === '' ? 0 : parseInt(radiusValue, 10);

            const imageUploadForm: ImageUploadForm = { firstImage, secondImage, radius };
            this.communicationService.post<ImageUploadForm>(imageUploadForm, routeToSend).subscribe({
                next: (response) => {
                    const responseString = ` ${response.status} - 
                    ${response.statusText} \n`;
                    if (response.body !== null) {
                        const serverResult: ImageUploadResult = JSON.parse(response.body);
                        this.updateImageDisplay(this.convertToBuffer(serverResult.resultImageByteArray));
                        this.debugDisplayMessage.next(
                            responseString +
                                serverResult.message +
                                '\n Number of differences = ' +
                                serverResult.numberOfDifferences +
                                '\n Generated game id = ' +
                                serverResult.generatedGameId,
                        );
                        this.formToSendAfterServerConfirmation = {
                            differences: serverResult.differences,
                            firstImage,
                            secondImage,
                            gameId: serverResult.generatedGameId,
                            gameName: '',
                        };
                        // this.formToSendAfterServerConfirmation.differences = serverResult.differences;
                        // this.formToSendAfterServerConfirmation.firstImage = firstImage;
                        // this.formToSendAfterServerConfirmation.secondImage = secondImage;
                        // this.formToSendAfterServerConfirmation.gameId = serverResult.generatedGameId;
                        (document.getElementById('gameNameField') as HTMLInputElement).hidden = false;
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

    async sendGameAndNameToServer(): Promise<void> {
        const routeToSend = '/games/saveGame';
        const nameValue = (document.getElementById('gameName') as HTMLInputElement).value;
        this.formToSendAfterServerConfirmation.gameName = nameValue;

        // eslint-disable-next-line no-console
        console.log('Sending ' + nameValue + 'to server (game id ' + this.formToSendAfterServerConfirmation.gameId + ')...');

        this.debugDisplayMessage.next('Sending ' + nameValue + 'to server (game id ' + this.formToSendAfterServerConfirmation.gameId + ')...');
        this.communicationService.post<EntireGameUploadForm>(this.formToSendAfterServerConfirmation, routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} - 
                ${response.statusText} \n`;
                this.debugDisplayMessage.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                const serverResult: ImageUploadResult = JSON.parse(err.error);
                this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
            },
        });
    }

    // Convert number[] to ArrayBuffer
    convertToBuffer(byteArray: number[]): ArrayBuffer {
        const buffer = new ArrayBuffer(byteArray.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < byteArray.length; i++) {
            view[i] = byteArray[i];
        }
        return buffer;
    }

    updateImageDisplay(imgData: ArrayBuffer) {
        const imagePreview = document.getElementById('image-preview') as HTMLImageElement;
        if (imagePreview !== null) imagePreview.src = URL.createObjectURL(new Blob([imgData]));
    }
}
