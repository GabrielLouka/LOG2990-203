import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HintService {
  maxGivenHints = 3;

  constructor(
    ) { }

  decrement(){
      if (this.maxGivenHints !== 0) {
        this.maxGivenHints--;
    } else {
        window.alert('Vous avez utilisé vos indices !');
    }

  }

  reset(){
    this.maxGivenHints = 3;
  }


}

