import { Location } from '@angular/common';
import { Component } from '@angular/core';
@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    title = 'Page de création de jeu';
    enlargementRadius: number = 3;
    originalImage = new Image();
    modifiedImage = new Image();
    gameName: string = '';
    constructor(private location: Location) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processImage(event: any, isModified: boolean) {
        const image: HTMLImageElement = new Image();
        image.src = URL.createObjectURL(event.target.files[0]);

        image.onload = () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (image.height !== 480 || image.width !== 640) {
                alert('Invalid size, please use an image of size 480x640: ' + image.width + 'x' + image.height);
                return;
            } else {
                let canvas;
                const canvasId = isModified ? 'modified-image' : 'original-image';
                // eslint-disable-next-line prefer-const
                canvas = document.getElementById(canvasId) as HTMLCanvasElement;
                // canvas.getContext('2d')?.drawImage(image, 0, 0);
                // eslint-disable-next-line max-len
                canvas.getContext('2d')?.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height); // destination rectangle
            }
            if (isModified) {
                this.modifiedImage = image;
            } else {
                this.originalImage = image;
            }
        };
    }
    resetCanvas(isModified: boolean) {
        let canvas: HTMLCanvasElement;
        const canvasId = isModified ? 'modified-image' : 'original-image';
        // eslint-disable-next-line prefer-const
        canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        // this.originalImage = new Image();
        // this.modifiedImage = new Image();
        return;
    }
    previousPage() {
        this.location.back();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateName(event: any) {
        this.gameName = event.target.value;
    }

    createGame() {
        // const enlargement = document.getElementById('enlargement-radius').value;
        const selObj = document.getElementById('enlargement-radius') as HTMLSelectElement;
        this.enlargementRadius = parseInt(selObj.value, 10);

        // Setting Value
    }
}
