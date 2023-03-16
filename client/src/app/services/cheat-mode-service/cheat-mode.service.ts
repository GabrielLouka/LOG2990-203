import { ElementRef, Injectable } from '@angular/core';
import { GameData } from '@common/game-data';
import { Buffer } from 'buffer';
import { ImageManipulationService } from '../image-manipulation-service/image-manipulation.service';

@Injectable({
  providedIn: 'root'
})
export class CheatModeService {  

  constructor(private imageManipulationService: ImageManipulationService) { }

  handleCheatEvent(
    keyboardEventWithBgColor: {tKeyEvent: KeyboardEvent, color: string, letterTpressed: boolean, intervalIDLeft: number, intervalIDRight: number}, 
    canvas: {rightCanvasContext: CanvasRenderingContext2D, leftCanvasContext: CanvasRenderingContext2D},
    images: {currentModifiedImage: Buffer, originalImage: Buffer},
    
    ){
    
    if (keyboardEventWithBgColor.tKeyEvent.key === 't') {
        if (keyboardEventWithBgColor.letterTpressed) {
            keyboardEventWithBgColor.color = '#66FF99';
            this.cheatMode(
                {rightCanvasContext: canvas.rightCanvasContext as CanvasRenderingContext2D, 
                    leftCanvasContext: canvas.leftCanvasContext as CanvasRenderingContext2D, currentModifiedImage: images.currentModifiedImage},
                {leftInterval: keyboardEventWithBgColor.intervalIDLeft, rightInterval: keyboardEventWithBgColor.intervalIDRight},
                {gameData: null, originalImage: images.originalImage, modifiedImage: null, foundDifferences: null}
            )

        } else {
            keyboardEventWithBgColor.color = '';
            window.clearInterval(keyboardEventWithBgColor.intervalIDLeft);
            window.clearInterval(keyboardEventWithBgColor.intervalIDRight);
            if (images.currentModifiedImage && images.originalImage) {
                this.imageManipulationService.loadCurrentImage(
                    images.currentModifiedImage,
                    canvas.rightCanvasContext as CanvasRenderingContext2D,
                );
                this.imageManipulationService.loadCurrentImage(images.originalImage, canvas.leftCanvasContext as CanvasRenderingContext2D);
            }
        }
        keyboardEventWithBgColor.letterTpressed = !keyboardEventWithBgColor.letterTpressed;
    }

  }

  cheatMode(
    canvasAndImages: {rightCanvasContext: CanvasRenderingContext2D, leftCanvasContext: CanvasRenderingContext2D, currentModifiedImage: Buffer},
    intervals: {leftInterval: number, rightInterval: number},
    game: { gameData: GameData | null; originalImage: Buffer; modifiedImage: Buffer | null, foundDifferences: boolean[] | null} | null    
  ){

    const newImage = this.imageManipulationService.getModifiedImageWithoutDifferences(
      game!.gameData as GameData,
      { originalImage: game!.originalImage, modifiedImage: game!.modifiedImage as Buffer},
      game!.foundDifferences as boolean[],
  );
    
    if (canvasAndImages.leftCanvasContext && canvasAndImages.rightCanvasContext) {
        intervals.leftInterval = this.imageManipulationService.alternateOldNewImage(
            game!.originalImage,
            newImage as Buffer,
            canvasAndImages.leftCanvasContext as CanvasRenderingContext2D,
        ) as number;
        
        intervals.rightInterval = this.imageManipulationService.alternateOldNewImage(
            game!.originalImage,
            canvasAndImages.currentModifiedImage ? canvasAndImages.currentModifiedImage : game!.modifiedImage as Buffer,
            canvasAndImages.rightCanvasContext as CanvasRenderingContext2D,
        ) as number;
        
        canvasAndImages.currentModifiedImage = newImage as Buffer;
    }
    
  }

  deactivateCheatMode(
    externalElements: {backgroundColor: string, letterTpressed: boolean}, 
    canvasAndImages:{ leftCanvasContext: CanvasRenderingContext2D, originalImage: Buffer},
    intervals: {leftInterval: number, rightInterval: number}
    ){

    window.clearInterval(intervals.leftInterval);
    window.clearInterval(intervals.rightInterval);
    this.imageManipulationService.loadCurrentImage(canvasAndImages.originalImage, canvasAndImages.leftCanvasContext as CanvasRenderingContext2D);
    externalElements.backgroundColor = '';
    externalElements.letterTpressed = true;
  }

  focusKeyEvent(cheat: ElementRef | undefined) {
    if (cheat) {
        cheat.nativeElement.focus();
    }
  }

  

}