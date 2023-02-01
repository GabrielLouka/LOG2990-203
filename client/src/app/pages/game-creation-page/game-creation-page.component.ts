/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, ElementRef, ViewChild } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
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

    gameName: string = '';
    totalDifferences = 0;
    enlargementRadius: number = 3;
    originalImage: File;
    modifiedImage: File;
    differencesImage: Blob;
    modifiedContainsImage = false;
    originalContainsImage = false;

    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    generatedGameId = -1;

    private readonly characterMax: number = 20;
    private readonly minDifferences: number = 3;
    private readonly maxDifferences: number = 9;

    constructor(private readonly communicationService: CommunicationService) {}
    async processImage(event: any, isModified: boolean) {
        const image: HTMLImageElement = new Image();
        const imageBuffer: ArrayBuffer = await event.target.files[0].arrayBuffer();
        image.src = URL.createObjectURL(event.target.files[0]);
        const canvas: HTMLCanvasElement = this.rightCanvas.nativeElement;

        image.onload = () => {
            if (!this.is24BitDepthBMP(imageBuffer)) {
                alert("L'image doit être en 24-bits");
                return;
            }

            if (image.height !== 480 || image.width !== 640) {
                alert('Taille invalide (' + image.width + 'x' + image.height + '), la taille doit être de : 640x480 pixels');
                return;
            }

            const context = this.getCanvas(isModified);
            context?.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

            if (isModified) {
                this.modifiedImage = event.target.files[0];
                this.modifiedContainsImage = true;
            } else {
                this.originalImage = event.target.files[0];
                this.originalContainsImage = true;
            }
        };
    }

    is24BitDepthBMP = (imageBuffer: ArrayBuffer): boolean => {
        const BITMAP_TYPE_OFFSET = 28;
        const BIT_COUNT_24 = 24;
        const dataView = new DataView(imageBuffer);
        return dataView.getUint16(BITMAP_TYPE_OFFSET, true) === BIT_COUNT_24;
    };

    resetCanvas(isModified: boolean) {
        const canvas: HTMLCanvasElement = this.rightCanvas.nativeElement;
        const context = this.getCanvas(isModified);
        context?.clearRect(0, 0, canvas.width, canvas.height);
        if (isModified) {
            this.modifiedContainsImage = false;
        } else {
            this.originalContainsImage = false;
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

    async sendImageToServer(): Promise<void> {
        const routeToSend = '/image_processing/send-image';

        if (this.originalImage !== undefined && this.modifiedImage !== undefined) {
            const buffer1 = await this.originalImage.arrayBuffer();
            const buffer2 = await this.modifiedImage.arrayBuffer();

            // convert buffer to int array
            const byteArray1: number[] = Array.from(new Uint8Array(buffer1));
            const byteArray2: number[] = Array.from(new Uint8Array(buffer2));

            this.debugDisplayMessage.next('Sending image to server...');

            const firstImage: DifferenceImage = { background: byteArray1, foreground: [] };
            const secondImage: DifferenceImage = { background: byteArray2, foreground: [] };
            const radius = this.enlargementRadius;
            const imageUploadForm: ImageUploadForm = { firstImage, secondImage, radius };
            this.communicationService.post<ImageUploadForm>(imageUploadForm, routeToSend).subscribe({
                next: (response) => {
                    const responseString = ` ${response.status} - 
                    ${response.statusText} \n`;
                    if (response.body !== null) {
                        const serverResult: ImageUploadResult = JSON.parse(response.body);
                        this.differencesImage = new Blob([this.convertToBuffer(serverResult.resultImageByteArray)]);
                        const differenceImage: HTMLImageElement = new Image();
                        differenceImage.src = URL.createObjectURL(this.differencesImage);
                        if (serverResult.numberOfDifferences < this.minDifferences || serverResult.numberOfDifferences > this.maxDifferences) {
                            alert(
                                'Il faut que le nombre total de différences' +
                                    "soit compris entre 3 et 9, veuillez changer d'images ou bien de rayon d'élargissement: " +
                                    +this.totalDifferences +
                                    ' différences détectées',
                            );
                            this.resetCanvas(true);
                            this.resetCanvas(false);
                            this.originalContainsImage = false;
                            this.modifiedContainsImage = false;
                            return;
                        }
                        this.totalDifferences = serverResult.numberOfDifferences;
                        differenceImage.onload = () => {
                            // TODO : A adapter avec la futur popup et changer la manière de faire
                            // let canvas;
                            // canvas = document.getElementById('difference-image') as HTMLCanvasElement;
                            // canvas
                            //     .getContext('2d')
                            // ?.drawImage(differenceImage, 0, 0, differenceImage.width, differenceImage.height, 0, 0, canvas.width, canvas.height);
                        };
                        this.debugDisplayMessage.next(
                            responseString +
                                serverResult.message +
                                '\n Number of differences = ' +
                                serverResult.numberOfDifferences +
                                '\n Generated game id = ' +
                                serverResult.generatedGameId,
                        );
                        this.generatedGameId = serverResult.generatedGameId;
                        // (document.getElementById('gameNameField') as HTMLInputElement).hidden = false;
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

    updateName(name: string) {
        // TODO utiliser un regex ? '^[a-zA-Z0-9]{3,20}$' (même que celui de registration min : 3 char/ max : 20 char)
        if (name.length === 0 || name.length > this.characterMax || name.trim().length === 0) {
            alert("Nom invalide. Veuillez entrer une chaine non vide d'une taille de 20 caracteres maximum");
        } else {
            this.gameName = name;
        }
    }

    submitRadius(radius: number) {
        this.enlargementRadius = radius;
    }

    async sendGameNameToServer(): Promise<void> {
        const routeToSend = '/games/updateName';
        const gameId = this.generatedGameId;

        console.log('Sending ' + this.gameName + 'to server (game id ' + gameId + ')...');

        this.debugDisplayMessage.next('Sending ' + this.gameName + 'to server (game id ' + gameId + ')...');
        this.communicationService.post<[number, string]>([gameId, this.gameName], routeToSend).subscribe({
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
