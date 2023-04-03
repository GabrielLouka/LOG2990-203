import { ElementRef, Injectable } from '@angular/core';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { GameData } from '@common/interfaces/game-data';
import { Buffer } from 'buffer';

@Injectable({
    providedIn: 'root',
})
export class CheatModeService {
    backgroundColor: string;
    intervalIDLeft: unknown;
    intervalIDRight: unknown;
    currentGameId: string;
    currentModifiedImage: Buffer;
    originalImage: Buffer;
    isCheating: boolean = false;
    constructor(
        private imageManipulationService: ImageManipulationService,
        private leftCanvasContext: CanvasRenderingContext2D,
        private rightCanvasContext: CanvasRenderingContext2D,
    ) {}

    focusKeyEvent(element: ElementRef | undefined) {
        if (element) {
            element.nativeElement.focus();
        }
    }


    activateCheatMode(gameData: GameData, images: { originalImage: Buffer; modifiedImage: Buffer }, foundDifferences: boolean[]) {
        this.backgroundColor = '#66FF99';
        const newImage = this.imageManipulationService.getModifiedImageWithoutDifferences(gameData, images, foundDifferences);
        this.originalImage = images.originalImage;
        this.intervalIDLeft = this.startInterval(
            { originalImage: images.originalImage, newImage },
            this.leftCanvasContext as CanvasRenderingContext2D,
        );
        this.intervalIDRight = this.startInterval(
            { originalImage: images.originalImage, newImage },
            this.rightCanvasContext as CanvasRenderingContext2D,
        );
        if (this.currentGameId !== '-1') {
            this.currentModifiedImage = newImage;
        }
        this.isCheating = !this.isCheating;
    }

    
    putCanvasIntoInitialState(
        images: { originalImage: Buffer; currentModifiedImage: Buffer },
        canvas: { leftContext: CanvasRenderingContext2D; rightContext: CanvasRenderingContext2D },
    ) {
        if (images.currentModifiedImage && images.originalImage) {
            this.imageManipulationService.loadCurrentImage(images.currentModifiedImage, canvas.rightContext as CanvasRenderingContext2D);
            this.imageManipulationService.loadCurrentImage(images.originalImage, canvas.leftContext as CanvasRenderingContext2D);
        }
    }

    stopCheating() {
        this.backgroundColor = '';
        window.clearInterval(this.intervalIDLeft as number);
        window.clearInterval(this.intervalIDRight as number);
        this.isCheating = !this.isCheating;
        this.putCanvasIntoInitialState(
            { originalImage: this.originalImage, currentModifiedImage: this.currentModifiedImage },
            { leftContext: this.leftCanvasContext as CanvasRenderingContext2D, rightContext: this.rightCanvasContext as CanvasRenderingContext2D },
        );
    }

    startInterval(images: { originalImage: Buffer; newImage: Buffer }, leftContext: CanvasRenderingContext2D) {
        return this.imageManipulationService.alternateOldNewImage(images.originalImage, images.newImage, leftContext as CanvasRenderingContext2D);
    }
}
