import { Injectable } from '@angular/core';
import { NUMBER_HINTS } from '@common/utils/env';

@Injectable({
  providedIn: 'root'
})
export class HintService {
  maxGivenHints = NUMBER_HINTS;

  constructor() { }

  decrement(){
    if (this.maxGivenHints !== 0) {
      this.maxGivenHints--;        
    } 
    // else {
    //     window.alert('Vous avez utilisé vos indices !');
    // }
  }

  reset(){
    this.maxGivenHints = NUMBER_HINTS;
  }


}

