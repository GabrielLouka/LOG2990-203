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

    title = 'Page de création de jeu';
    currentStep: number = 0;
    gameName: string = '';
    totalDifferences = 0;
    enlargementRadius: number = 3;
    originalImage: File;
    modifiedImage: File;
    differencesImage: Blob;
    modifiedContainsImage = false;
    originalContainsImage = false;

    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    generatedGameId = -1;
    steps = [
        'Choisir deux images en format BMP 24-bit de taille 640x480',
        "Preciser le rayon d'elargissement voulu afin de détecter les différences",
        "Cliquer ici afin de lancer l'algorithme de détection de différences:",
        'Entrer un nom de jeu:',
        'Envoyer le jeu:',
    ];

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private readonly characterMax: number = 20;
    private readonly minDifferences: number = 3;
    private readonly maxDifferences: number = 9;

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
            if (isModified) {
                this.modifiedImage = event.target.files[0];
                this.modifiedContainsImage = true;
            } else {
                this.originalImage = event.target.files[0];
                this.originalContainsImage = true;
            }
            // if (this.originalContainsImage && this.modifiedContainsImage && this.currentStep === 0) {
            //     this.currentStep++;
            // }
        };
    }

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
                            this.currentStep = 0;
                            this.resetCanvas(true);
                            this.resetCanvas(false);
                            this.originalContainsImage = false;
                            this.modifiedContainsImage = false;
                            return;
                        }
                        this.totalDifferences = serverResult.numberOfDifferences;
                        differenceImage.onload = () => {
                            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                            let canvas;
                            // eslint-disable-next-line prefer-const
                            canvas = document.getElementById('difference-image') as HTMLCanvasElement;
                            // eslint-disable-next-line max-len
                            canvas
                                .getContext('2d')
                                ?.drawImage(differenceImage, 0, 0, differenceImage.width, differenceImage.height, 0, 0, canvas.width, canvas.height);
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

    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateName(name: string) {
        if (name.length === 0 || name.length > this.characterMax || name.trim().length === 0) {
            alert("Nom invalide. Veuillez entrer une chaine non vide d'une taille de 20 caracteres maximum");
        } else {
            this.gameName = name;
            this.currentStep++;
        }
    }

    submitRadius(radius: number) {
        this.enlargementRadius = radius;
        this.currentStep++;
    }

    async sendGameNameToServer(): Promise<void> {
        const routeToSend = '/games/updateName';
        const gameId = this.generatedGameId;

        // eslint-disable-next-line no-console
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
}
