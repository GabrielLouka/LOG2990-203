import { Component } from '@angular/core';
import { Coordinate } from '@app/interfaces/coordinate';
import { MouseClickHandlerService } from '@app/services/mouse-click-handler.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    constructor(private mouse: MouseClickHandlerService) {}

    onMouseClick(coordinate: Coordinate) {
      this.mouse.onClick() {
        
      }
    }

}
