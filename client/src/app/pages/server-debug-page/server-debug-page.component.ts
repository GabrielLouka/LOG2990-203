/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActionsContainer, Tool } from '@app/classes/actions-container';
import { ClearElement } from '@app/classes/clear-element';
import { DuplicationElement } from '@app/classes/duplication-element';
import { SwitchElement } from '@app/classes/switch-element';
import { UndoElement } from '@app/classes/undo-element.abstract';
import { CommunicationService } from '@app/services/communication.service';
import { DifferenceImage } from '@common/difference.image';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { GameData } from '@common/game-data';
import { ImageUploadForm } from '@common/image.upload.form';
import { ImageUploadResult } from '@common/image.upload.result';
import { Vector2 } from '@common/vector2';
import { Buffer } from 'buffer';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-server-debug-page',
    templateUrl: './server-debug-page.component.html',
    styleUrls: ['./server-debug-page.component.scss'],
})
export class ServerDebugPageComponent implements AfterViewInit {
    @ViewChild('leftCanvas', { static: false })
    leftCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('rightCanvas', { static: false })
    rightCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('palette', { static: false })
    palette: ElementRef<HTMLDivElement>;
    context: CanvasRenderingContext2D;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    games: { gameData: GameData; originalImage: Buffer; modifiedImage: Buffer }[];
    formToSendAfterServerConfirmation: EntireGameUploadForm;
    actions: { pixels: Vector2[]; color: string }[] = [];
    color: string = 'black';
    redoActions: { pixels: Vector2[]; color: string }[] = [];
    undoActions: UndoElement[] = [];
    actionsContainer: ActionsContainer;
    selectedTool: any;
    leftContext: CanvasRenderingContext2D;
    rightContext: CanvasRenderingContext2D;
    constructor(private readonly communicationService: CommunicationService) {}
    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
            this.redo();
        } else if (event.ctrlKey && event.key === 'z') {
            this.undo();
        }
    }
    ngAfterViewInit(): void {
        this.leftContext = this.leftCanvas.nativeElement.getContext('2d')!;
        this.rightContext = this.rightCanvas.nativeElement.getContext('2d')!;
        this.leftCanvas.nativeElement.width = 500;
        this.leftCanvas.nativeElement.height = 500;
        this.rightCanvas.nativeElement.width = 500;
        this.rightCanvas.nativeElement.height = 500;
        // this.actionsContainer = new ActionsContainer(this.leftCanvas, this.rightCanvas, black);
        this.selectedTool = Tool.CRAYON;
        this.setupListeners();
    }

    selectTool(selectedTool: string) {
        this.actionsContainer.selectedTool = Tool[selectedTool.toUpperCase() as keyof typeof Tool];
        this.debugDisplayMessage.next('YOU PICKED: ' + this.actionsContainer.selectedTool);
    }
    setupListeners() {
        this.leftCanvas.nativeElement.addEventListener('mouseup', () => {
            this.displayChangedPixels();
        });
        this.rightCanvas.nativeElement.addEventListener('mouseup', () => {
            this.displayChangedPixels();
        });
    }

    undo() {
        this.actionsContainer.undo();
    }
    redo() {
        this.actionsContainer.redo();
    }

    eraseCanvas(isLeft: boolean) {
        const clearElement = new ClearElement(isLeft);
        clearElement.actionsToCopy = this.actionsContainer.undoActions;
        if (isLeft) {
            clearElement.draw(this.leftContext);
        } else {
            clearElement.draw(this.rightContext);
        }
        this.actionsContainer.undoActions.push(clearElement);
    }
    switchCanvases() {
        const switchElement = new SwitchElement();
        switchElement.loadCanvases(this.actionsContainer.undoActions, this.leftContext, this.rightContext);
        switchElement.draw(this.rightContext);

        this.actionsContainer.undoActions.push(switchElement);
    }
    duplicateCanvas(copyOnLeft: boolean) {
        let squashedContext;
        if (copyOnLeft) {
            squashedContext = this.leftContext;
        } else {
            squashedContext = this.rightContext;
        }

        const duplication = new DuplicationElement(copyOnLeft);
        duplication.loadActions(this.actionsContainer.undoActions);
        duplication.draw(squashedContext);
        this.actionsContainer.undoActions.push(duplication);
    }
    displayChangedPixels() {
        let message = '';
        for (let i = 0; i < this.actionsContainer.undoActions.length; i++) {
            message += `Stroke ${i + 1}: `;
            for (const pixel of this.actionsContainer.undoActions[i].pixels) {
                message += `[${pixel.x},${pixel.y}] `;
            }
            message += '\n';
        }
        this.debugDisplayMessage.next(message);
    }
    async getGame() {
        let gameId = (document.getElementById('gameId') as HTMLInputElement).value;
        if (gameId === null || gameId === undefined || gameId === '') gameId = '0';
        const routeToSend = '/games/fetchGame/' + gameId;

        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} - 
                ${response.statusText} \n`;

                if (response.body !== null) {
                    const serverResult = JSON.parse(response.body);
                    this.debugDisplayMessage.next(responseString);
                    this.games = [serverResult];
                    this.showImagesForRetrievedGames();
                }
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                const serverResult: ImageUploadResult = JSON.parse(err.error);
                this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
            },
        });
    }
    async showImagesForRetrievedGames() {
        for (const game of this.games) {
            const originalImage = game.originalImage;
            const imageElement = new Image();

            imageElement.src = `data:image/bmp;base64,${Buffer.from(originalImage).toString('base64')}`;
            imageElement.style.width = '320px';
            imageElement.style.height = '240px';
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
                    this.showImagesForRetrievedGames();
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
                            isEasy: serverResult.isEasy,
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

    async deleteAllGames(): Promise<void> {
        const routeToSend = '/games/deleteAllGames';
        this.communicationService.delete(routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} - 
                ${response.statusText} \n`;
                this.debugDisplayMessage.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                this.debugDisplayMessage.next(responseString);
            },
        });
    }

    async getDifferenceIndex(): Promise<void> {
        const routeToSend = '/match/getDifferenceIndex';
        const gameId = (document.getElementById('gameId') as HTMLInputElement).value;
        const pixelToCheckPositionX = (document.getElementById('pixelToCheckPositionX') as HTMLInputElement).value;
        const pixelToCheckPositionY = (document.getElementById('pixelToCheckPositionY') as HTMLInputElement).value;
        const pixelToCheckPosition: Vector2 = { x: parseInt(pixelToCheckPositionX, 10), y: parseInt(pixelToCheckPositionY, 10) };

        this.communicationService
            .post<{ gameId: string; clickPosition: Vector2 }>({ gameId, clickPosition: pixelToCheckPosition }, routeToSend)
            .subscribe({
                next: (response) => {
                    const responseString = ` ${response.status} - 
                ${response.statusText} \n`;
                    this.debugDisplayMessage.next(responseString + ' found ' + response.body);
                },
                error: (err: HttpErrorResponse) => {
                    const responseString = `Server Error : ${err.message}`;
                    this.debugDisplayMessage.next(responseString);
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

    // private redraw() {
    //     this.clearCanvas();
    //     for (const action of this.actions) {
    //         this.context.beginPath();
    //         this.context.moveTo(action.pixels[0].x, action.pixels[0].y);
    //         this.context.strokeStyle = action.color;
    //         for (const pixel of action.pixels) {
    //             this.context.lineTo(pixel.x, pixel.y);
    //             this.context.stroke();
    //         }
    //     }
    // }

    // private clearCanvas() {
    //     this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    // }
}
