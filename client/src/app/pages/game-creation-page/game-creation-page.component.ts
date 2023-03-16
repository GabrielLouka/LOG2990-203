import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActionsContainer, ToolType } from '@app/classes/actions-container/actions-container';
import { ClearElement } from '@app/classes/clear-element/clear-element';
import { DuplicationElement } from '@app/classes/duplication-element/duplication-element';
import { SwitchElement } from '@app/classes/switch-element/switch-element';
import { CreationResultModalComponent } from '@app/components/creation-result-modal/creation-result-modal.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { DifferenceImage } from '@common/difference.image';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { ImageUploadForm } from '@common/image.upload.form';
import { ImageUploadResult } from '@common/image.upload.result';
import { CANVAS_HEIGHT, CANVAS_WIDTH, NOT_FOUND, PEN_WIDTH } from '@common/utils/env';
import { Vector2 } from '@common/vector2';
import { Buffer } from 'buffer';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements AfterViewInit, OnInit {
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

    @ViewChild('combine') combine!: ElementRef;

    totalDifferences = 0;
    isEasy = true;
    enlargementRadius: number = 3;
    originalImage: File | null;
    modifiedImage: File | null;
    penWidth: number = PEN_WIDTH;
    actionsContainer: ActionsContainer;
    leftDrawingContext: CanvasRenderingContext2D;
    rightDrawingContext: CanvasRenderingContext2D;
    selectedTool: unknown;
    defaultImagePath: string = '../../assets/img/image_empty.bmp';
    defaultImageFile: File;

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

    async ngOnInit() {
        await this.loadDefaultImages();
    }

    ngAfterViewInit(): void {
        this.leftDrawingContext = this.drawingCanvasOne.nativeElement.getContext('2d');
        this.rightDrawingContext = this.drawingCanvasTwo.nativeElement.getContext('2d');
        this.actionsContainer = new ActionsContainer(this.drawingCanvasOne, this.drawingCanvasTwo);
    }

    refreshSelectedColor() {
        this.actionsContainer.color = this.colorPicker.nativeElement.value;
    }

    setPenWidth(isIncremented: boolean) {
        this.penWidth = this.penWidth + (isIncremented ? 1 : NOT_FOUND);
        if (this.penWidth < 1) this.penWidth = 1;
        if (this.penWidth > PEN_WIDTH) this.penWidth = PEN_WIDTH;

        this.actionsContainer.penWidth = this.penWidth;
    }

    deactivateTools() {
        this.actionsContainer.selectTool(ToolType.NONE);
        this.pen.nativeElement.style.backgroundColor = 'white';
        this.rubber.nativeElement.style.backgroundColor = 'white';
        this.rectangle.nativeElement.style.backgroundColor = 'white';
    }

    selectTool(toolName: string) {
        const toolToSelect: ToolType = ToolType[toolName.toUpperCase() as keyof typeof ToolType];
        if (!(this.actionsContainer.selectedToolType === toolToSelect)) {
            this.actionsContainer.selectTool(toolToSelect);
            this.pen.nativeElement.style.backgroundColor = toolToSelect === ToolType.CRAYON ? 'salmon' : 'white';
            this.rubber.nativeElement.style.backgroundColor = toolToSelect === ToolType.ERASER ? 'salmon' : 'white';
            this.rectangle.nativeElement.style.backgroundColor = toolToSelect === ToolType.RECTANGLE ? 'salmon' : 'white';
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

        switchElement.applyElementAction(this.leftDrawingContext);
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
        duplication.applyElementAction(squashedContext);
        this.actionsContainer.undoActions.push(duplication);
    }

    async processImage(event: Event, isModified: boolean) {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.files === null || inputElement.files.length === 0) return;
        const image: HTMLImageElement = new Image();
        const imageBuffer: ArrayBuffer = await inputElement.files[0].arrayBuffer();
        image.src = URL.createObjectURL(inputElement.files[0]);
        const canvas: HTMLCanvasElement = this.rightCanvas.nativeElement;
        const imageDimensions: Vector2 = this.imageManipulationService.getImageDimensions(Buffer.from(imageBuffer));

        image.onload = () => {
            if (!this.is24BitDepthBMP(imageBuffer)) {
                alert("L'image doit être en 24-bits");
                image.src = URL.createObjectURL(this.defaultImageFile);
                return;
            }

            if (imageDimensions.y !== CANVAS_HEIGHT || imageDimensions.x !== CANVAS_WIDTH) {
                alert('Taille invalide (' + image.width + 'x' + image.height + '), la taille doit être de : 640x480 pixels');
                return;
            }

            const context = this.getCanvas(isModified);
            context?.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

            if (inputElement.files) {
                if (isModified) {
                    this.modifiedImage = inputElement.files[0];
                } else {
                    this.originalImage = inputElement.files[0];
                }
            }
        };
    }
    is24BitDepthBMP = (imageBuffer: ArrayBuffer): boolean => {
        const BITMAP_TYPE_OFFSET = 28;
        const BIT_COUNT_24 = 24;
        const dataView = new DataView(imageBuffer);
        return dataView.getUint16(BITMAP_TYPE_OFFSET, true) === BIT_COUNT_24;
    };

    resetBackgroundCanvas(rightImage: boolean) {
        const canvasSize: HTMLCanvasElement = this.rightCanvas.nativeElement;

        const context = this.getCanvas(rightImage);
        context?.clearRect(0, 0, canvasSize.width, canvasSize.height);

        if (rightImage) {
            this.input2.nativeElement.value = '';
        } else {
            this.input1.nativeElement.value = '';
        }
    }

    resetForegroundCanvas(isLeft: boolean) {
        const clearElement = new ClearElement(isLeft);
        clearElement.actionsToCopy = this.actionsContainer.undoActions;
        if (isLeft) {
            clearElement.applyElementAction(this.leftDrawingContext);
        } else {
            clearElement.applyElementAction(this.rightDrawingContext);
        }
        this.actionsContainer.undoActions.push(clearElement);
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
        this.resultModal.showPopUp();

        // TODO : store this value in a global constant file
        const routeToSend = '/image_processing/send-image';

        if (this.originalImage && this.modifiedImage) {
            const buffer1 = await this.originalImage.arrayBuffer();
            const buffer2 = await this.modifiedImage.arrayBuffer();

            this.imageManipulationService.combineImages(Buffer.from(buffer1), this.drawingCanvasOne.nativeElement);
            this.imageManipulationService.combineImages(Buffer.from(buffer2), this.drawingCanvasTwo.nativeElement);
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
                    this.handleImageUploadResponse(response, firstImage, secondImage);
                },
                error: (err: HttpErrorResponse) => {
                    window.alert(JSON.stringify(err));
                },
            });
        }
    }

    handleImageUploadResponse(response: HttpResponse<string>, firstImage: DifferenceImage, secondImage: DifferenceImage) {
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
            this.resultModal.showGameNameForm(this.totalDifferences, this.formToSendAfterServerConfirmation);
        }
    }

    async loadDefaultImages() {
        if (!this.defaultImageFile) this.defaultImageFile = await this.createFile(this.defaultImagePath, 'defaultImage.bmp', 'image/bmp');
        this.originalImage = this.defaultImageFile;
        this.modifiedImage = this.defaultImageFile;
    }

    async createFile(path: string, name: string, type: string): Promise<File> {
        const response = await fetch(path);
        const data = await response.blob();
        const metadata = {
            type,
        };
        return new File([data], name, metadata);
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
