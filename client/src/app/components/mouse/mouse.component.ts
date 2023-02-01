import { Component } from '@angular/core';
import { Coordinate } from '@app/interfaces/coordinate';
import { MouseHandlerService } from '@app/services/mouse-handler.service';

@Component({
    selector: 'app-mouse',
    templateUrl: './mouse.component.html',
    styleUrls: ['./mouse.component.scss'],
})
export class MouseComponent {
    // @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

    // TODO mettre constances dans un fichier
    width = 640;
    height = 480;
    src = '/Users/Marie-Jade/Desktop/LOG2990/projet2/LOG2990-203/client/src/assets/img/original-picture.png';

    constructor(private mouseService: MouseHandlerService) {}

    // ngOnInit() {
    //     const canvas = this.canvas.nativeElement;
    //     const ctx = canvas.getContext('2d');

    //     const image = new Image();
    //     image.src = this.src;
    //     image.onload = () => {
    //         ctx?.drawImage(image, 0, 0);
    //     };
    // }

    onMouseDown(event: MouseEvent) {
        const coordinateClick: Coordinate = { x: event.offsetX, y: Math.abs(event.offsetY - this.height) };
        this.mouseService.onMouseDown(coordinateClick);
    }

    onMouseUp(event: MouseEvent) {
        const coordinateClick: Coordinate = { x: event.offsetX, y: Math.abs(event.offsetY - this.height) };
        this.mouseService.onMouseUp(coordinateClick);
    }
}
