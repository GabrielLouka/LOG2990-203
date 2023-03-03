/* eslint-disable @typescript-eslint/no-magic-numbers */
import { UndoElement } from './undo-element.abstract';

export class EraserElement extends UndoElement {
    // draw(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
    //     context.beginPath();

    //     context.lineWidth = this.penWidth;
    //     context.lineCap = 'butt';

    //     context.moveTo(this.pixels[0].x, this.pixels[0].y);
    //     const stroke = this.pixels;
    //     for (let j = 1; j < stroke.length; j++) {
    //         context.clearRect(stroke[j].x - this.penWidth / 2, stroke[j].y - this.penWidth / 2, this.penWidth, this.penWidth);
    //     }
    //     context.stroke();
    //     return context;
    // }

    draw(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.beginPath();

        const stroke = this.pixels;

        for (let i = 1; i < stroke.length; i++) {
            const prevPoint = stroke[i - 1];
            const currentPoint = stroke[i];

            const x = Math.min(prevPoint.x, currentPoint.x) - this.penWidth / 2;
            const y = Math.min(prevPoint.y, currentPoint.y) - this.penWidth / 2;
            const width = Math.abs(prevPoint.x - currentPoint.x) + this.penWidth / 2;
            const height = Math.abs(prevPoint.y - currentPoint.y) + this.penWidth / 2;

            context.clearRect(x, y, width, height);
        }

        context.stroke();

        return context;
    }
}
