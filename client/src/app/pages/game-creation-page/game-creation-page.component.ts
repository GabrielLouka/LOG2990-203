/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component } from '@angular/core';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    title = 'Page de création de jeu';
    currentStep: number = 0;
    totalDifferences = 0;
    enlargementRadius: number = 3;
    originalImage = new Image();
    modifiedImage = new Image();
    modifiedContainsImage = false;
    originalContainsImage = false;
    steps = [
        'Choisir deux images en format BMP 24-bit de taille 640x480',
        "Preciser le rayon d'elargissement voulu afin de détecter les différences",
        "Cliquer ici afin de lancer l'algorithme de détection de différences:",
        'Entrer un nom de jeu:',
        'Envoyer le jeu:',
    ];
    gameName: string = '';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private readonly characterMax: number = 20;
    private readonly minDifferences: number = 3;
    private readonly maxDifferences: number = 9;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processImage(event: any, isModified: boolean) {
        const image: HTMLImageElement = new Image();
        image.src = URL.createObjectURL(event.target.files[0]);

        image.onload = () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (image.height !== 480 || image.width !== 640) {
                alert('Taille invalide (' + image.width + 'x' + image.height + '), veuillez utiliser une image de taille 640x480: ');
                return;
            } else {
                let canvas;
                const canvasId = isModified ? 'modified-image' : 'original-image';
                // eslint-disable-next-line prefer-const
                canvas = document.getElementById(canvasId) as HTMLCanvasElement;
                // canvas.getContext('2d')?.drawImage(image, 0, 0);
                // eslint-disable-next-line max-len
                canvas.getContext('2d')?.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
            }
            if (isModified) {
                this.modifiedImage = image;
                this.modifiedContainsImage = true;
            } else {
                this.originalImage = image;
                this.originalContainsImage = true;
            }
            if (this.originalContainsImage && this.modifiedContainsImage && this.currentStep === 0) {
                this.currentStep++;
            }
        };
    }
    resetCanvas(isModified: boolean) {
        let canvas: HTMLCanvasElement;
        const canvasId = isModified ? 'modified-image' : 'original-image';
        // eslint-disable-next-line prefer-const
        canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        if (isModified) {
            this.modifiedContainsImage = false;
        } else {
            this.originalContainsImage = false;
        }
        this.currentStep = 0;
        // this.originalImage = new Image();
        // this.modifiedImage = new Image();
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateName(name: string) {
        if (name.length === 0 || name.length > this.characterMax || name.trim().length === 0) {
            alert("Nom invalide. Veuillez entrer une chaine non vide d'une taille de 20 caracteres maximum");
        } else {
            this.gameName = name;
            this.currentStep++;
        }
    }

    submitRadius(radius: number) {
        this.enlargementRadius = radius;
        this.currentStep++;
    }
    submitImages() {
        if (this.totalDifferences < this.minDifferences || this.totalDifferences > this.maxDifferences) {
            alert(
                "Il faut que le nombre total de différences soit compris entre 3 et 9, veuillez changer d'images ou bien de rayon d'élargissement: " +
                    +this.totalDifferences +
                    ' différences détectées',
            );
            this.currentStep = 0;
            this.originalContainsImage = false;
            this.modifiedContainsImage = false;
            return false;
        } else {
            this.currentStep++;
            return true;
        }
    }
}
