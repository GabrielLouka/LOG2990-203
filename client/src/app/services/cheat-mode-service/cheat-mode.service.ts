import { ElementRef, Injectable } from '@angular/core';
import { Buffer } from 'buffer';
import { ImageManipulationService } from '../image-manipulation-service/image-manipulation.service';

@Injectable({
  providedIn: 'root'
})
export class CheatModeService {  
    constructor(private imageManipulationService: ImageManipulationService) { }
    
    focusKeyEvent(cheat: ElementRef | undefined) {
      if (cheat) {
          cheat.nativeElement.focus();
      }
    }

    putCanvasIntoInitialState(
      images: {originalImage: Buffer, currentModifiedImage: Buffer},
      canvas: {leftContext: CanvasRenderingContext2D, rightContext: CanvasRenderingContext2D}
      ){
      if (images.currentModifiedImage && images.originalImage) {
          this.imageManipulationService.loadCurrentImage(
              images.currentModifiedImage,
              canvas.rightContext as CanvasRenderingContext2D,
          );
          this.imageManipulationService.loadCurrentImage(images.originalImage, canvas.leftContext as CanvasRenderingContext2D);
      }
    }

    inverseCheatingState(isCheating: boolean){
      return !isCheating;
    }

    stopCheating(leftInterval: number, rightInterval: number){
      window.clearInterval(leftInterval);
      window.clearInterval(rightInterval);               
    }

}