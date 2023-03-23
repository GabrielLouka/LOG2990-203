import { ElementRef, Injectable } from '@angular/core';
import { MILLISECOND_TO_SECONDS, MINUTE_LIMIT, MINUTE_TO_SECONDS } from '@common/utils/env';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  shouldStop: boolean = false;

  constructor() { }

  getMinutes(timeInSeconds: number){
    return Math.floor(timeInSeconds / MINUTE_TO_SECONDS);

  }

  getSeconds(timeInSeconds: number){
    return Math.floor(timeInSeconds % MINUTE_TO_SECONDS);
  }

  endTimer(minute: ElementRef, second: ElementRef, timeInSeconds: number){
    return this.setInterval(minute, second, timeInSeconds)
  }

  setInterval(minute: ElementRef, second: ElementRef, timeInSeconds: number){
    const intervalId = window.setInterval(() => {
      if (timeInSeconds >= 0){
        this.ticToc(minute, second, timeInSeconds);
      }
    }, MILLISECOND_TO_SECONDS);
    return intervalId;
  }

  clearInterval(intervalId: number){
    window.clearInterval(intervalId);
  }

  ticToc(minute: ElementRef, second: ElementRef, timeInSeconds: number){
    minute.nativeElement.innerText = this.returnNewMinutes(timeInSeconds);
    second.nativeElement.innerText = this.returnNewSeconds(timeInSeconds);
  }

  returnNewMinutes(timeInSeconds: number){
    this.getMinutes(timeInSeconds) < MINUTE_LIMIT ? 
      '0' + this.getMinutes(timeInSeconds) : this.getMinutes(timeInSeconds);
  }

  returnNewSeconds(timeInSeconds: number){
    return this.getSeconds(timeInSeconds) < MINUTE_LIMIT ? 
    '0' + this.getSeconds(timeInSeconds) : this.getSeconds(timeInSeconds);
  }

  stopTimer(){
    this.shouldStop = true;
  }

}
