import { Component } from '@angular/core';
import { Coordinate } from '@app/interfaces/coordinate';
import { MouseHandlerService } from '@app/services/mouse-handler.service';

@Component({
    selector: 'app-mouse',
    templateUrl: './mouse.component.html',
    styleUrls: ['./mouse.component.scss'],
})
export class MouseComponent {
    // TODO mettre constances dans un fichier
    width = 640;
    height = 480;
    src = './assets/img/original-picture.png';

    constructor(private mouseService: MouseHandlerService) {}

    onMouseDown(event: MouseEvent) {
        const coordinateClick: Coordinate = { x: event.offsetX, y: Math.abs(event.offsetY - this.height) };
        this.mouseService.onMouseDown(coordinateClick);
    }

    onMouseUp(event: MouseEvent) {
        const coordinateClick: Coordinate = { x: event.offsetX, y: Math.abs(event.offsetY - this.height) };
        this.mouseService.onMouseUp(coordinateClick);
    }
}
