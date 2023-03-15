import { Injectable } from '@angular/core';
import { ImageManipulationService } from './image-manipulation.service';

@Injectable({
  providedIn: 'root'
})
export class CheatModeService {
  letterTPressed: boolean = true;
  intervalIDLeft: number | undefined;
  intervalIDRight: number | undefined;

  constructor(public imageService: ImageManipulationService) { }

  

}
