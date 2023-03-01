/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActionsContainer, Tool } from '@app/classes/actions-container';
import { DuplicationElement } from '@app/classes/duplication-element';
import { SwitchElement } from '@app/classes/switch-element';
import { UndoElement } from '@app/classes/undo-element.abstract';
import { CreationResultModalComponent } from '@app/components/creation-result-modal/creation-result-modal.component';
import { CommunicationService } from '@app/services/communication.service';
import { ImageManipulationService } from '@app/services/image-manipulation.service';
import { DifferenceImage } from '@common/difference.image';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { ImageUploadForm } from '@common/image.upload.form';
import { ImageUploadResult } from '@common/image.upload.result';
import { Vector2 } from '@common/vector2';
import { Buffer } from 'buffer';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements AfterViewInit {
    @ViewChild('originalImage') leftCanvas!: ElementRef;
    @ViewChild('modifiedImage') rightCanvas!: ElementRef;
    @ViewChild('input1') input1!: ElementRef;
    @ViewChild('input2') input2!: ElementRef;
    @ViewChild('resultModal') resultModal!: CreationResultModalComponent;
    @ViewChild('drawingCanvasOne') drawingCanvasOne!: ElementRef;
    @ViewChild('drawingCanvasTwo') drawingCanvasTwo!: ElementRef;
    @ViewChild('colorPicker') colorPicker!: ElementRef;
    @ViewChild('pen') pen!: ElementRef;
    @ViewChild('rubber') rubber!: ElementRef;
    @ViewChild('rectangle') rectangle!: ElementRef;

    totalDifferences = 0;
    isEasy = true;
    enlargementRadius: number = 3;
    originalImage: File | null;
    modifiedImage: File | null;
    modifiedContainsImage = false;
    originalContainsImage = false;
    penActive: boolean = false;
    rubberActive: boolean = false;
    penWidth: number = 20;
    redoActions: { pixels: Vector2[]; color: string }[] = [];
    undoActions: UndoElement[] = [];
    actionsContainer: ActionsContainer;
    leftDrawingContext: CanvasRenderingContext2D;
    rightDrawingContext: CanvasRenderingContext2D;
    selectedTool: unknown;

    formToSendAfterServerConfirmation: EntireGameUploadForm;

    constructor(private readonly communicationService: CommunicationService, private readonly imageManipulationService: ImageManipulationService) {}

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
            this.redo();
        } else if (event.ctrlKey && event.key === 'z') {
            this.undo();
        }
    }

    ngAfterViewInit(): void {
        this.leftDrawingContext = this.drawingCanvasOne.nativeElement.getContext('2d')!;
        this.rightDrawingContext = this.drawingCanvasTwo.nativeElement.getContext('2d')!;
        this.actionsContainer = new ActionsContainer(this.drawingCanvasOne, this.drawingCanvasTwo);
    }

    colorModification() {
        this.actionsContainer.color = this.colorPicker.nativeElement.value;
    }

    widthModification(isIncremented: boolean) {
        if (isIncremented && this.actionsContainer.penWidth < 20) {
            this.penWidth++;
            this.actionsContainer.penWidth = this.penWidth;
        } else if (!isIncremented && this.actionsContainer.penWidth > 1) {
            this.penWidth--;
            this.actionsContainer.penWidth = this.penWidth;
        }
    }

    activatePen(selectedTool: string) {
        this.activateTool(selectedTool, Tool.CRAYON);
    }

    activateRubber(selectedTool: string) {
        this.activateTool(selectedTool, Tool.ERASER);
    }

    activateRectangle(selectedTool: string) {
        this.activateTool(selectedTool, Tool.RECTANGLE);
    }

    deactivateTools() {
        this.actionsContainer.selectedTool = Tool.NONE;
        this.pen.nativeElement.style.backgroundColor = 'white';
        this.rubber.nativeElement.style.backgroundColor = 'white';
        this.rectangle.nativeElement.style.backgroundColor = 'white';
    }

    activateTool(selectedTool: string, tool: Tool) {
        if (!(this.actionsContainer.selectedTool === tool)) {
            this.actionsContainer.selectedTool = Tool[selectedTool.toUpperCase() as keyof typeof Tool];
            this.pen.nativeElement.style.backgroundColor = tool === Tool.CRAYON ? 'salmon' : 'white';
            this.rubber.nativeElement.style.backgroundColor = tool === Tool.ERASER ? 'salmon' : 'white';
            this.rectangle.nativeElement.style.backgroundColor = tool === Tool.RECTANGLE ? 'salmon' : 'white';
        } else {
            this.deactivateTools();
        }
    }

    undo() {
        this.actionsContainer.undo();
    }
    redo() {
        this.actionsContainer.redo();
    }

    switchCanvases() {
        const switchElement = new SwitchElement();
        switchElement.loadCanvases(this.actionsContainer.undoActions, this.leftDrawingContext, this.rightDrawingContext);
        switchElement.draw(this.rightDrawingContext);

        this.actionsContainer.undoActions.push(switchElement);
    }

    duplicateCanvas(copyOnLeft: boolean) {
        let squashedContext;
        if (copyOnLeft) {
            squashedContext = this.leftDrawingContext;
        } else {
            squashedContext = this.rightDrawingContext;
        }

        const duplication = new DuplicationElement(copyOnLeft);
        duplication.loadActions(this.actionsContainer.undoActions);
        duplication.draw(squashedContext);
        this.actionsContainer.undoActions.push(duplication);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async processImage(event: any, isModified: boolean) {
        if (event.target.files.length === 0) return;
        const image: HTMLImageElement = new Image();
        const imageBuffer: ArrayBuffer = await event.target.files[0].arrayBuffer();
        image.src = URL.createObjectURL(event.target.files[0]);
        const canvas: HTMLCanvasElement = this.rightCanvas.nativeElement;
        const imageDimensions: Vector2 = this.imageManipulationService.getImageDimensions(Buffer.from(imageBuffer));

        image.onload = () => {
            if (!this.is24BitDepthBMP(imageBuffer)) {
                alert("L'image doit être en 24-bits");
                return;
            }

            if (imageDimensions.y !== 480 || imageDimensions.x !== 640) {
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

    resetCanvas(rightImage: boolean, isDrawingLayer: boolean) {
        const canvasSize: HTMLCanvasElement = this.rightCanvas.nativeElement;

        if (!isDrawingLayer) {
            const context = this.getCanvas(rightImage);
            context?.clearRect(0, 0, canvasSize.width, canvasSize.height);

            if (rightImage) {
                this.input2.nativeElement.value = '';
                this.modifiedContainsImage = false;
            } else {
                this.input1.nativeElement.value = '';
                this.originalContainsImage = false;
            }
        } else {
            if (!rightImage) {
                const context = this.drawingCanvasOne.nativeElement.getContext('2d');
                context?.clearRect(0, 0, canvasSize.width, canvasSize.height);
            } else {
                const context = this.drawingCanvasTwo.nativeElement.getContext('2d');
                context?.clearRect(0, 0, canvasSize.width, canvasSize.height);
            }
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

        this.resultModal.showPopUp();

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

            this.resultModal.updateImageDisplay(new ArrayBuffer(0));

            const firstImage: DifferenceImage = { background: byteArray1, foreground: [] };
            const secondImage: DifferenceImage = { background: byteArray2, foreground: [] };
            const radius = this.enlargementRadius;

            const imageUploadForm: ImageUploadForm = { firstImage, secondImage, radius };
            this.communicationService.post<ImageUploadForm>(imageUploadForm, routeToSend).subscribe({
                next: (response) => {
                    if (response.body !== null) {
                        const serverResult: ImageUploadResult = JSON.parse(response.body);
                        this.resultModal.updateImageDisplay(this.convertToBuffer(serverResult.resultImageByteArray));
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
                        this.resultModal.showGameNameForm(this.totalDifferences);
                    }
                },
                error: (err: HttpErrorResponse) => {
                    window.alert(err);
                },
            });
        }
    }

    submitRadius(radius: number) {
        this.enlargementRadius = radius;
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
