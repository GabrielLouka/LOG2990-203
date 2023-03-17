import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CheatModeService {  

  constructor(/*private imageManipulationService: ImageManipulationService, private matchmakingService: MatchmakingService*/) { }

  
  // handleEvent(chat: ChatComponent, event: KeyboardEvent, isTPressed: boolean, color: string){
  //   if (this.matchmakingService.isSoloMode || document.activeElement != chat.input.nativeElement){
  //     if (event.key === 't'){
  //       if (isTPressed){
  //         color = '#66FF99';
  //         this.cheatMode();
  //       }
  //       else{
  //         color = '';
  //         this.stopShowingDifferences();
  //         this.putCanvasIntoInitialState();
  //       }
  //       isTPressed = !isTPressed;
  //     }
  //   }
  // }

  // cheatMode(newImage: Buffer){
  //   this.showHiddenDifferences(newImage);
  // }

  // showHiddenDifferences(newImage: Buffer){

  // }



  
  focusKeyEvent(cheat: ElementRef | undefined) {
    if (cheat) {
        cheat.nativeElement.focus();
    }
  }

  

}