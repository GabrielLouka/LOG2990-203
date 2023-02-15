/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable } from '@angular/core';
import { Coordinate } from '@app/interfaces/coordinate';

export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 500;

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    context: CanvasRenderingContext2D;
    private canvasSize: Coordinate = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    drawGrid() {
        this.context.beginPath();
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 3;

        this.context.moveTo((this.width * 3) / 10, (this.height * 4) / 10);
        this.context.lineTo((this.width * 7) / 10, (this.height * 4) / 10);

        this.context.moveTo((this.width * 3) / 10, (this.height * 6) / 10);
        this.context.lineTo((this.width * 7) / 10, (this.height * 6) / 10);

        this.context.moveTo((this.width * 4) / 10, (this.height * 3) / 10);
        this.context.lineTo((this.width * 4) / 10, (this.height * 7) / 10);

        this.context.moveTo((this.width * 6) / 10, (this.height * 3) / 10);
        this.context.lineTo((this.width * 6) / 10, (this.height * 7) / 10);

        this.context.stroke();
    }

    drawWord(word: string) {
        const startPosition: Coordinate = { x: 175, y: 100 };
        const step = 20;
        this.context.font = '20px system-ui';
        for (let i = 0; i < word.length; i++) {
            this.context.fillText(word[i], startPosition.x + step * i, startPosition.y);
        }
    }
}
