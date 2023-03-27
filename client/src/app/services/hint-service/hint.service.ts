import { ElementRef, Injectable } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MILLISECOND_TO_SECONDS, NUMBER_HINTS } from '@common/utils/env';

@Injectable({
  providedIn: 'root'
})
export class HintService {
  maxGivenHints = NUMBER_HINTS;

  constructor() { }

  decrement(){
      this.maxGivenHints--;
  }

  reset(){
    this.maxGivenHints = NUMBER_HINTS;
  }

  handleHint(chat: ChatComponent, time: number){
    let now = new Date();
    let formattedTime = now.toLocaleTimeString('en-US', { hour12: false }) + ' - Indice utilisé';
    chat.sendSystemMessage(formattedTime);
    return time + 10; //will be a constant, and will recall same method for LT but negation
  }


  showMessage(penaltyMessage: ElementRef){
    penaltyMessage.nativeElement.style.display = this.returnDisplay('block');
    setTimeout(() => {
        if (penaltyMessage.nativeElement.style.display !== "none") {
            penaltyMessage.nativeElement.style.display = this.returnDisplay('none');
        }
      }, MILLISECOND_TO_SECONDS);
    
  }

  returnDisplay(display: string){
    return display;
  }


}

