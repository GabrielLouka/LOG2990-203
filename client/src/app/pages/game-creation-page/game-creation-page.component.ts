/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    @ViewChild('originalImage') leftCanvas!: ElementRef;
    @ViewChild('modifiedImage') rightCanvas!: ElementRef;

    processImage(event: any, isModified: boolean) {
        const image: HTMLImageElement = new Image();
        image.src = URL.createObjectURL(event.target.files[0]);
        const canvas: HTMLCanvasElement = this.rightCanvas.nativeElement;

        image.onload = () => {
            if (image.height !== 480 || image.width !== 640) {
                alert('Taille invalide (' + image.width + 'x' + image.height + '), la taille doit être de : 640x480 pixels');
                return;
            } else {
                const context = this.getCanvas(isModified);
                context?.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
            }
        };
    }

    resetCanvas(isModified: boolean) {
        const canvas: HTMLCanvasElement = this.rightCanvas.nativeElement;
        const context = this.getCanvas(isModified);
        context?.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    getCanvas(isModified: boolean) {
        if (isModified) {
            const rightCanvas: HTMLCanvasElement = this.rightCanvas.nativeElement;
            const rightContext = rightCanvas.getContext('2d');
            return rightContext;
        } else {
            const leftCanvas: HTMLCanvasElement = this.leftCanvas.nativeElement;
            const leftContext = leftCanvas.getContext('2d');
            return leftContext;
        }
    }
    // currentStep: number = 0;
    // totalDifferences = 0;
    // enlargementRadius: number = 3;

    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // updateName(name: string) {
    //     if (name.length === 0 || name.length > this.characterMax || name.trim().length === 0) {
    //         alert("Nom invalide. Veuillez entrer une chaine non vide d'une taille de 20 caracteres maximum");
    //     } else {
    //         this.gameName = name;
    //         this.currentStep++;
    //     }
    // }

    // submitRadius(radius: number) {
    //     this.enlargementRadius = radius;
    //     this.currentStep++;
    // }
    // submitImages() {
    //     if (this.totalDifferences < this.minDifferences || this.totalDifferences > this.maxDifferences) {
    //         alert(
    //             "Il faut que le nombre total de différences soit compris entre 3 et 9, veuillez changer d'images ou bien de rayon d'élargissement: " +
    //                 +this.totalDifferences +
    //                 ' différences détectées',
    //         );
    //         this.currentStep = 0;
    //         this.originalContainsImage = false;
    //         this.modifiedContainsImage = false;
    //         return false;
    //     } else {
    //         this.currentStep++;
    //         return true;
    //     }
    // }
}
