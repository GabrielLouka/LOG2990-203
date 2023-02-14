/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, ElementRef, ViewChild } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { DifferenceImage } from '@common/difference.image';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { ImageUploadForm } from '@common/image.upload.form';
import { ImageUploadResult } from '@common/image.upload.result';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})

// TODO faire de ce component un service
export class GameCreationPageComponent {
    static readonly maxNumberOfDifferences: number = 9;
    static readonly minNumberOfDifferences: number = 3;

    @ViewChild('originalImage') leftCanvas!: ElementRef;
    @ViewChild('modifiedImage') rightCanvas!: ElementRef;
    @ViewChild('bgModal') modal!: ElementRef;
    @ViewChild('gameNameForm') gameNameForm!: ElementRef;
    @ViewChild('errorPopupText') errorPopupText!: ElementRef;
    @ViewChild('imagePreview') imagePreview!: ElementRef;
    @ViewChild('input1') input1!: ElementRef;
    @ViewChild('input2') input2!: ElementRef;

    gameName: string = '';
    totalDifferences = 0;
    isEasy = true;
    enlargementRadius: number = 3;
    originalImage: File | null;
    modifiedImage: File | null;
    differencesImage: Blob;
    modifiedContainsImage = false;
    originalContainsImage = false;

    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');

    titleRegistration = new FormGroup({
        title: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[-a-zA-Z0-9-()]{3,15}(\\s+[-a-zA-Z0-9-()]+)*$')])),
    });

    formToSendAfterServerConfirmation: EntireGameUploadForm;

    constructor(private readonly communicationService: CommunicationService, private readonly router: Router) {}

    showPopUp() {
        this.toggleElementVisibility(this.gameNameForm, false);
        this.toggleElementVisibility(this.errorPopupText, false);
        this.errorPopupText.nativeElement.style.color = 'red';
        this.modal.nativeElement.style.display = 'flex';
    }

    closePopUp() {
        this.modal.nativeElement.style.display = 'none';
    }

    toggleElementVisibility(element: ElementRef<any>, isVisible: boolean) {
        element.nativeElement.style.display = isVisible ? 'flex' : 'none';
    }
    async processImage(event: any, isModified: boolean) {
        if (event.target.files.length === 0) return;
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

    resetCanvas(rightImage: boolean) {
        const canvas: HTMLCanvasElement = this.rightCanvas.nativeElement;
        const context = this.getCanvas(rightImage);
        context?.clearRect(0, 0, canvas.width, canvas.height);

        if (rightImage) {
            this.input2.nativeElement.value = '';
            this.modifiedContainsImage = false;
        } else {
            this.input1.nativeElement.value = '';
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

    canSendToServer(): boolean {
        return this.originalContainsImage && this.modifiedContainsImage;
    }

    async sendImageToServer(): Promise<void> {
        if (!this.canSendToServer()) {
            alert('Veuillez ajouter deux images');
            return;
        }

        this.showPopUp();

        const routeToSend = '/image_processing/send-image';

        if (
            this.originalImage !== undefined &&
            this.modifiedImage !== undefined &&
            this.originalContainsImage &&
            this.modifiedContainsImage &&
            this.originalImage !== null &&
            this.modifiedImage !== null
        ) {
            const buffer1 = await this.originalImage.arrayBuffer();
            const buffer2 = await this.modifiedImage.arrayBuffer();

            // convert buffer to int array
            const byteArray1: number[] = Array.from(new Uint8Array(buffer1));
            const byteArray2: number[] = Array.from(new Uint8Array(buffer2));

            this.updateImageDisplay(new ArrayBuffer(0));

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
                            isEasy: serverResult.isEasy,
                        };
                        this.totalDifferences = serverResult.numberOfDifferences;
                        this.isEasy = serverResult.isEasy;
                        if (this.isNumberOfDifferencesValid()) {
                            this.toggleElementVisibility(this.gameNameForm, true);
                        } else {
                            this.toggleElementVisibility(this.gameNameForm, false);
                            this.toggleElementVisibility(this.errorPopupText, true);
                        }
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

    submitRadius(radius: number) {
        this.enlargementRadius = radius;
    }

    async sendGameNameToServer(): Promise<void> {
        const routeToSend = '/games/saveGame';
        this.formToSendAfterServerConfirmation.gameName = this.gameName;

        // console.log('Sending ' + this.gameName + 'to server (game id ' + this.formToSendAfterServerConfirmation.gameId + ')...');

        this.debugDisplayMessage.next('Sending ' + this.gameName + 'to server (game id ' + this.formToSendAfterServerConfirmation.gameId + ')...');
        this.communicationService.post<EntireGameUploadForm>(this.formToSendAfterServerConfirmation, routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} - 
                ${response.statusText} \n`;
                this.debugDisplayMessage.next(responseString);
                this.closePopUp();
                this.router.navigate(['/home']);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                const serverResult: ImageUploadResult = JSON.parse(err.error);
                this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
            },
        });
    }

    isNumberOfDifferencesValid(): boolean {
        return (
            this.totalDifferences >= GameCreationPageComponent.minNumberOfDifferences &&
            this.totalDifferences <= GameCreationPageComponent.maxNumberOfDifferences
        );
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
        const canvas: HTMLCanvasElement = this.imagePreview.nativeElement;
        const ctx = canvas.getContext('2d');
        if (ctx !== null) {
            const img = new Image();
            img.src = URL.createObjectURL(new Blob([imgData]));
            img.onload = () => {
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
            };
        }
    }
}
