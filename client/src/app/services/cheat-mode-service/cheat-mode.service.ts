import { ElementRef, Injectable } from '@angular/core';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { Buffer } from 'buffer';

@Injectable({
    providedIn: 'root',
})
export class CheatModeService {
    constructor(private imageManipulationService: ImageManipulationService) {}

    focusKeyEvent(cheat: ElementRef | undefined) {
        if (cheat) {
            cheat.nativeElement.focus();
        }
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

    stopCheating(leftInterval: number, rightInterval: number) {
        window.clearInterval(leftInterval);
        window.clearInterval(rightInterval);
    }

    startInterval(images: { originalImage: Buffer; newImage: Buffer }, leftContext: CanvasRenderingContext2D) {
        return this.imageManipulationService.alternateOldNewImage(images.originalImage, images.newImage, leftContext as CanvasRenderingContext2D);
    }
}
