import { Component } from '@angular/core';
import { Coordinate } from '@app/interfaces/coordinate';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { REQUIRED_HEIGHT, REQUIRED_WIDTH } from '@common/pixel';
@Component({
    selector: 'app-mouse',
    templateUrl: './mouse.component.html',
    styleUrls: ['./mouse.component.scss'],
})
export class MouseComponent {
    width = REQUIRED_WIDTH;
    height = REQUIRED_HEIGHT;

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
