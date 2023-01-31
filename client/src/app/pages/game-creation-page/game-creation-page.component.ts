/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { DifferenceImage } from '@common/difference.image';
import { ImageUploadForm } from '@common/image.upload.form';
import { ImageUploadResult } from '@common/image.upload.result';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    @ViewChild('originalImage') leftCanvas!: ElementRef;
    @ViewChild('modifiedImage') rightCanvas!: ElementRef;
    @ViewChild('input1') image1!: ElementRef;
    @ViewChild('input2') image2!: ElementRef;
    @ViewChild('radiusInput', { static: false }) radius: ElementRef;

    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    generatedGameId = -1;

    constructor(private readonly communicationService: CommunicationService) {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processImage(event: any, isModified: boolean) {
        const image: HTMLImageElement = new Image();
        image.src = URL.createObjectURL(event.target.files[0]);
        const canvas: HTMLCanvasElement = this.rightCanvas.nativeElement;

        image.onload = () => {
            if (image.height !== 480 || image.width !== 640) {
                alert('Taille invalide (' + image.width + 'x' + image.height + '), la taille doit être de : 640x480 pixels');
                return;
            } else {
                const context = this.getCanvas(isModified);
                context?.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
            }
        };
    }

    resetCanvas(isModified: boolean) {
        const canvas: HTMLCanvasElement = this.rightCanvas.nativeElement;
        const context = this.getCanvas(isModified);
        context?.clearRect(0, 0, canvas.width, canvas.height);
    }

    async sendImageToServer(): Promise<void> {
        const routeToSend = '/image_processing/send-image';

        const picture1: File = this.image1.nativeElement.files?.[0];
        const picture2: File = this.image2.nativeElement.files?.[0];
        const radiusValue: string = this.radius.nativeElement.value;

        console.log(radiusValue);
        console.log(picture1);
        console.log(picture2);

        if (picture1 !== undefined && picture2 !== undefined) {
            const buffer1 = await picture1.arrayBuffer();
            const buffer2 = await picture2.arrayBuffer();

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
                        console.log(
                            responseString +
                                serverResult.message +
                                '\n Number of differences = ' +
                                serverResult.numberOfDifferences +
                                '\n Generated game id = ' +
                                serverResult.generatedGameId,
                        );
                        this.generatedGameId = serverResult.generatedGameId;
                        (document.getElementById('gameNameField') as HTMLInputElement).hidden = false;
                    }
                },
                error: (err: HttpErrorResponse) => {
                    const responseString = `Server Error : ${err.message}`;
                    const serverResult: ImageUploadResult = JSON.parse(err.error);
                    this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
                    console.log('nombre de différences : ' + serverResult.numberOfDifferences);
                },
            });
        }
    }

    getCanvas(isModified: boolean) {
        if (isModified) {
            const rightCanvas: HTMLCanvasElement = this.rightCanvas.nativeElement;
            const rightContext = rightCanvas.getContext('2d');
            return rightContext;
        } else {
            const leftCanvas: HTMLCanvasElement = this.leftCanvas.nativeElement;
            const leftContext = leftCanvas.getContext('2d');
            return leftContext;
        }
    }

    async sendGameNameToServer(): Promise<void> {
        const routeToSend = '/games/updateName';
        const nameValue = (document.getElementById('gameName') as HTMLInputElement).value;
        const gameId = this.generatedGameId;

        // eslint-disable-next-line no-console
        console.log('Sending ' + nameValue + 'to server (game id ' + gameId + ')...');

        this.debugDisplayMessage.next('Sending ' + nameValue + 'to server (game id ' + gameId + ')...');
        this.communicationService.post<[number, string]>([gameId, nameValue], routeToSend).subscribe({
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
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    // ADAPTER POUR L'AVANT PLAN
    // switchCanvas(isModified: boolean) {
    //     const leftCanvas: HTMLCanvasElement = this.leftCanvas.nativeElement;
    //     const rightCanvas: HTMLCanvasElement = this.rightCanvas.nativeElement;
    //     if (isModified) {
    //         leftCanvas.getContext('2d')?.drawImage(rightCanvas, 0, 0);
    //         this.resetCanvas(isModified);
    //     } else {
    //         rightCanvas.getContext('2d')?.drawImage(leftCanvas, 0, 0);
    //         this.resetCanvas(isModified);
    //     }
    // }
}
